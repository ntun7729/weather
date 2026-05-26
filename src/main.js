import { generateWeatherBriefing } from "./lib/ai.js";
import { fetchWeatherBundle, reverseLocation, searchLocations } from "./lib/weather.js";
import { APP_JS } from "./ui/app.js";
import { APP_CSS } from "./ui/styles.js";
import { renderAppShell } from "./ui/template.js";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {})
    }
  });
}

function html(markup) {
  return new Response(markup, {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}

function asset(content, type) {
  return new Response(content, {
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=300"
    }
  });
}

function readPayload(url) {
  const raw = new URL(url).searchParams.get("payload");

  if (!raw) {
    throw new Error("Missing location payload.");
  }

  return JSON.parse(raw);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/") {
        return html(renderAppShell());
      }

      if (request.method === "GET" && url.pathname === "/assets/app.css") {
        return asset(APP_CSS, "text/css; charset=utf-8");
      }

      if (request.method === "GET" && url.pathname === "/assets/app.js") {
        return asset(APP_JS, "application/javascript; charset=utf-8");
      }

      if (request.method === "GET" && url.pathname === "/api/search") {
        const query = url.searchParams.get("q") || "";
        return json({ results: await searchLocations(query) });
      }

      if (request.method === "GET" && url.pathname === "/api/reverse") {
        const lat = Number(url.searchParams.get("lat"));
        const lon = Number(url.searchParams.get("lon"));
        return json({ location: await reverseLocation(lat, lon) });
      }

      if (request.method === "GET" && url.pathname === "/api/weather") {
        return json(await fetchWeatherBundle(readPayload(request.url)));
      }

      if (request.method === "POST" && url.pathname === "/api/ai/briefing") {
        const payload = await request.json();
        return json(await generateWeatherBriefing(env, payload));
      }

      if (request.method === "GET" && url.pathname === "/health") {
        return json({
          ok: true,
          service: "weather-command-center",
          providerProxyPolicy: env.PROXY_POLICY || "direct-first",
          aiDefaultProvider: env.AI_DEFAULT_PROVIDER || "gemini"
        });
      }

      return new Response("Not found", { status: 404 });
    } catch (error) {
      return json(
        {
          ok: false,
          error: error.message
        },
        { status: 500 }
      );
    }
  }
};
