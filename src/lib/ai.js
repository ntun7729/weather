import { fetchJson } from "./http.js";

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || "").replace(/\/+$/, "");
}

function listProxyHosts(env) {
  return String(env.PROXY_HOSTS || env.PROXYIP || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveProviderConfig(payload, env) {
  const provider = payload.provider || env.AI_DEFAULT_PROVIDER || "gemini";

  if (provider === "gemini") {
    return {
      provider,
      model: payload.model || env.GEMINI_MODEL || "gemini-2.5-flash",
      apiKey: payload.apiKey || env.GEMINI_API_KEY || env.AI_API_KEY || "",
      baseUrl: normalizeBaseUrl(payload.baseUrl || env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai")
    };
  }

  return {
    provider,
    model: payload.model || env.OPENAI_MODEL || env.AI_DEFAULT_MODEL || "gpt-4.1-mini",
    apiKey: payload.apiKey || env.OPENAI_API_KEY || env.AI_API_KEY || "",
    baseUrl: normalizeBaseUrl(payload.baseUrl || env.OPENAI_BASE_URL || "https://api.openai.com/v1")
  };
}

function swapOrigin(baseUrl, proxyHost) {
  const direct = new URL(baseUrl);
  const proxyOrigin = proxyHost.startsWith("http://") || proxyHost.startsWith("https://")
    ? new URL(proxyHost)
    : new URL(`https://${proxyHost}`);

  proxyOrigin.pathname = direct.pathname;
  proxyOrigin.search = direct.search;
  return proxyOrigin.toString().replace(/\/+$/, "");
}

function buildMessages(mode, weatherPayload, notes) {
  const system = [
    "You are a precise weather operations analyst.",
    "Use only the supplied weather JSON.",
    "Highlight decision-useful insight, not generic small talk.",
    "Be concise, grounded, and practical."
  ].join(" ");

  const user = {
    mode,
    instruction:
      mode === "planner"
        ? "Produce a compact plan for commute, outdoor time, hydration, clothing, and any risk windows."
        : "Produce a clean summary with the main changes, risks, and best timing windows for the next day.",
    operatorNotes: notes || "",
    weather: weatherPayload
  };

  return [
    { role: "system", content: system },
    { role: "user", content: JSON.stringify(user) }
  ];
}

async function tryChatCompletion({ baseUrl, apiKey, model, messages, signal }) {
  const result = await fetchJson(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      messages
    }),
    signal
  });

  const text = result.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("The AI provider returned no message content.");
  }

  return text;
}

export async function generateWeatherBriefing(env, payload) {
  const config = resolveProviderConfig(payload, env);

  if (!config.apiKey) {
    throw new Error("Missing AI API key. Provide one in Settings or set a Worker secret.");
  }

  const proxyPolicy = String(env.PROXY_POLICY || "direct-first");
  const proxies = listProxyHosts(env);
  const routeBases = [];

  if (proxyPolicy === "proxy-first" && proxies.length) {
    routeBases.push(...proxies.map((proxyHost) => swapOrigin(config.baseUrl, proxyHost)));
    routeBases.push(config.baseUrl);
  } else {
    routeBases.push(config.baseUrl);
    routeBases.push(...proxies.map((proxyHost) => swapOrigin(config.baseUrl, proxyHost)));
  }

  const dedupedBases = [...new Set(routeBases)];
  const messages = buildMessages(payload.mode || "briefing", payload.weather, payload.notes);
  const failures = [];

  for (const baseUrl of dedupedBases) {
    const controller = new AbortController();
    const timeout = Number(env.AI_DIRECT_TIMEOUT_MS || 12000);
    const timer = setTimeout(() => controller.abort("AI request timed out"), timeout);

    try {
      const content = await tryChatCompletion({
        baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        messages,
        signal: controller.signal
      });

      clearTimeout(timer);

      return {
        provider: config.provider,
        model: config.model,
        route: baseUrl === config.baseUrl ? "direct" : "proxy-fallback",
        content
      };
    } catch (error) {
      clearTimeout(timer);
      failures.push(`${baseUrl}: ${error.message}`);
    }
  }

  throw new Error(`AI request failed across all routes. ${failures.join(" | ")}`);
}
