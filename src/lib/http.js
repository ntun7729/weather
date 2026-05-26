export async function fetchJson(url, init = {}, parse = true) {
  const response = await fetch(url, init);

  if (!response.ok) {
    const errorText = await response.text();
    const message = `${response.status} ${response.statusText}: ${errorText.slice(0, 240)}`;
    throw new Error(message);
  }

  return parse ? response.json() : response.text();
}

export function withQuery(url, params) {
  const next = new URL(url);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    next.searchParams.set(key, String(value));
  });

  return next.toString();
}
