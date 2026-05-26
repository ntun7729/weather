# Weather Command Center

Weather Command Center is a Cloudflare Worker web app with a full weather dashboard, saved locations, air quality, alerts, and an AI weather desk that works with either:

- Gemini's OpenAI-compatible endpoint
- OpenAI-compatible APIs and relays

The project is intentionally Worker-first and keeps the weather and AI calls on the server side so the browser does not need to talk directly to upstream APIs.

## What is in the app

- Search places globally with Open-Meteo geocoding
- Reverse geocode current device location
- Reliable global forecast deck from Open-Meteo
- U.S. severe weather alert overlay from NOAA / National Weather Service
- Air quality panel with AQI, PM2.5, PM10, and ozone
- Saved locations watch list in browser storage
- AI weather briefing and day planner
- Cloudflare-aware `direct-first` proxy fallback idea for AI upstreams, inspired by `Up2`

## Weather source choice

This app uses:

- `api.open-meteo.com` for forecast data
- `air-quality-api.open-meteo.com` for AQI and pollutant data
- `api.weather.gov` for U.S. alerts when the location is in the United States

Why this mix:

- Open-Meteo is globally available and dependable for worker-side JSON consumption.
- NOAA/NWS is authoritative for U.S. public alerts.
- The app keeps the source ledger visible in the UI so operators can see where the data is coming from.

## AI key support

The settings panel supports:

1. `Gemini compatible`
   - Default base URL: `https://generativelanguage.googleapis.com/v1beta/openai`
   - Recommended models: `gemini-2.5-flash`, `gemini-2.5-pro`
2. `OpenAI compatible`
   - Default base URL: `https://api.openai.com/v1`
   - Works with OpenAI-compatible relays and gateways too

You can either:

- paste the API key into the settings panel for browser-local storage
- set a Worker secret and let the backend use it

Suggested secrets:

```bash
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put OPENAI_API_KEY
```

## Proxy fallback idea

This project reuses the same operational idea described in `Up2`:

- try direct first
- only use proxy fallback when direct routing fails or when you deliberately choose `proxy-first`

For this app, that logic is applied to AI upstreams, because those are the endpoints most likely to vary by relay, mirror, or compatibility gateway.

Optional variables:

```text
PROXY_POLICY=direct-first
PROXY_HOSTS=relay1.example.com,relay2.example.com
```

If `PROXY_HOSTS` is set, the worker will retry the same OpenAI-compatible path on those hosts after a direct failure.

## Local development

```bash
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:8787
```

## Deploy

```bash
npm test
npx wrangler deploy
```

Optional runtime vars:

```bash
npx wrangler deploy \
  --var AI_DEFAULT_PROVIDER:gemini \
  --var AI_DEFAULT_MODEL:gemini-2.5-flash \
  --var PROXY_POLICY:direct-first \
  --var PROXY_HOSTS:relay1.example.com
```

## File map

```text
src/main.js          Worker routes and API surface
src/lib/weather.js   Weather, AQI, alerts, and operational highlights
src/lib/ai.js        Gemini/OpenAI-compatible AI proxy logic
src/ui/template.js   HTML shell
src/ui/styles.js     Dashboard styling
src/ui/app.js        Client-side interactions and rendering
```
