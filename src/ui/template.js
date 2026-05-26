export function renderAppShell() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Weather Command Center</title>
    <meta
      name="description"
      content="Cloudflare-ready weather dashboard with reliable forecast data, AI briefings, alerts, air quality, and planning tools."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body>
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">WX</div>
          <div class="brand-copy">
            <strong>Weather Command Center</strong>
            <span>Cloudflare Worker edition</span>
          </div>
        </div>

        <div class="nav-group" id="navGroup">
          <button class="nav-button active" data-target="overview">Overview</button>
          <button class="nav-button" data-target="forecast">Forecast deck</button>
          <button class="nav-button" data-target="air">Air and alerts</button>
          <button class="nav-button" data-target="intel">AI briefing</button>
          <button class="nav-button" data-target="settings">Settings</button>
        </div>

        <div class="sidebar-meta">
          <div>
            <strong>Why this source stack</strong>
            Open-Meteo delivers global forecast coverage, and U.S. alert coverage upgrades to NOAA when available.
          </div>
          <div>
            <strong>Built for operations</strong>
            Commute timing, rain windows, air quality, favorites, and AI summaries are all on one surface.
          </div>
          <div>
            <strong>Cloudflare-aware AI routing</strong>
            Optional proxy fallback follows the same direct-first idea used in the Up2 reference.
          </div>
        </div>
      </aside>

      <main class="content">
        <header class="topbar">
          <div class="search-wrap">
            <div class="search-row">
              <input id="searchInput" class="search-input" placeholder="Search city, region, or airport area" autocomplete="off" />
              <button id="searchButton" class="primary-button">Search</button>
              <button id="geoButton" class="ghost-button">Use my location</button>
            </div>
            <div id="searchResults" class="search-results"></div>
          </div>

          <div class="toolbar">
            <div class="segment" id="unitSegment">
              <button data-unit="metric" class="active">Metric</button>
              <button data-unit="imperial">Imperial</button>
            </div>
            <button id="refreshButton" class="ghost-button">Refresh</button>
            <button id="saveFavoriteButton" class="ghost-button">Save place</button>
          </div>
        </header>

        <section id="overview" class="dashboard-grid">
          <div class="panel hero-panel">
            <div class="panel-inner">
              <div class="hero-header">
                <div>
                  <div class="eyebrow" id="heroEyebrow">Waiting for a location</div>
                  <h1 class="place-title" id="placeTitle">Weather Command Center</h1>
                  <div class="hero-summary">
                    <span class="status-pill" id="heroSummary">Forecast data will load here.</span>
                    <span id="heroTimestamp" class="muted"></span>
                  </div>
                </div>
                <div class="hero-temp" id="heroTemp">--</div>
              </div>

              <div class="meta-grid" id="metaGrid"></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-inner">
              <div class="panel-head">
                <div class="section-title">
                  <h2>Operational highlights</h2>
                  <small>Fast reads for decisions, not just pretty numbers.</small>
                </div>
              </div>
              <div id="highlightCards" class="watchout-list"></div>
              <div class="panel-head" style="margin-top:20px;">
                <div class="section-title">
                  <h2>Watchouts</h2>
                  <small>Short-term risks worth keeping an eye on.</small>
                </div>
              </div>
              <div id="watchoutList" class="watchout-list"></div>
            </div>
          </div>
        </section>

        <section id="forecast" class="panel">
          <div class="panel-inner">
            <div class="panel-head">
              <div class="section-title">
                <h2>Next 12 hours</h2>
                <small>Temperature bars with rain probability and wind speed.</small>
              </div>
            </div>
            <div id="hourlyGrid" class="hourly-grid"></div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-inner">
            <div class="panel-head">
              <div class="section-title">
                <h2>Seven-day outlook</h2>
                <small>Daily trend, wind, rain signal, and UV exposure.</small>
              </div>
            </div>
            <div id="dailyGrid" class="daily-grid"></div>
          </div>
        </section>

        <section id="air" class="panel">
          <div class="panel-inner panel-grid">
            <div>
              <div class="panel-head">
                <div class="section-title">
                  <h2>Air quality</h2>
                  <small>U.S. AQI with particulate and ozone context.</small>
                </div>
              </div>
              <div id="airPanel" class="air-band"></div>
            </div>
            <div>
              <div class="panel-head">
                <div class="section-title">
                  <h2>Alerts</h2>
                  <small>NOAA alert feed appears automatically for U.S. locations.</small>
                </div>
              </div>
              <div id="alertStack" class="alert-stack"></div>
            </div>
          </div>
        </section>

        <section class="favorites-dock">
          <div class="panel-head">
            <div class="section-title">
              <h2>Saved places</h2>
              <small>Keep a small watch list for the spots you care about most.</small>
            </div>
            <div class="muted" id="favoritesCount"></div>
          </div>
          <div id="favoriteList" class="favorite-list"></div>
        </section>

        <section id="intel" class="panel">
          <div class="panel-inner panel-grid">
            <div>
              <div class="panel-head">
                <div class="section-title">
                  <h2>AI weather desk</h2>
                  <small>Works with Gemini’s OpenAI-compatible endpoint or any OpenAI-compatible key.</small>
                </div>
              </div>
              <div class="quick-actions">
                <button class="quick-action" data-ai-mode="briefing">Generate briefing</button>
                <button class="quick-action" data-ai-mode="planner">Plan my day</button>
                <button class="quick-action" id="copyAiButton">Copy output</button>
              </div>
              <div style="height:16px;"></div>
              <div id="aiOutput" class="ai-output">Load a location, then ask the weather desk for a briefing.</div>
            </div>
            <div>
              <div class="panel-head">
                <div class="section-title">
                  <h2>Source ledger</h2>
                  <small>So you can see exactly where this dashboard is getting its signal.</small>
                </div>
              </div>
              <div id="sourceList" class="source-list"></div>
            </div>
          </div>
        </section>

        <section id="settings" class="panel">
          <div class="panel-inner">
            <div class="panel-head">
              <div class="section-title">
                <h2>Settings</h2>
                <small>Bring your own AI key, override the endpoint, or change the default model.</small>
              </div>
            </div>
            <div class="settings-grid">
              <div class="setting-block">
                <label for="providerSelect">Provider</label>
                <select id="providerSelect" class="provider-select">
                  <option value="gemini">Gemini compatible</option>
                  <option value="openai">OpenAI compatible</option>
                </select>
                <label for="modelInput">Model</label>
                <input id="modelInput" class="text-input" placeholder="gpt-4.1-mini or gemini-2.5-flash" />
                <label for="baseUrlInput">Base URL</label>
                <input id="baseUrlInput" class="text-input" placeholder="Optional custom OpenAI-compatible endpoint" />
              </div>
              <div class="setting-block">
                <label for="apiKeyInput">API key</label>
                <input id="apiKeyInput" class="text-input" type="password" placeholder="Stored only in your browser unless you set a Worker secret" />
                <label for="notesInput">Operator notes</label>
                <textarea id="notesInput" class="textarea" placeholder="Optional notes to include in your AI prompts, such as commute time, workout plans, or travel priorities."></textarea>
                <button id="saveSettingsButton" class="primary-button">Save settings</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;
}
