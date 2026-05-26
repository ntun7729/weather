export const APP_JS = String.raw`
const state = {
  units: localStorage.getItem("weather.units") || "metric",
  favorites: safeParse(localStorage.getItem("weather.favorites"), []),
  settings: safeParse(localStorage.getItem("weather.aiSettings"), {
    provider: "gemini",
    model: "",
    baseUrl: "",
    apiKey: "",
    notes: ""
  }),
  searchResults: [],
  currentLocation: null,
  currentWeather: null
};

const dom = {
  searchInput: document.getElementById("searchInput"),
  searchButton: document.getElementById("searchButton"),
  geoButton: document.getElementById("geoButton"),
  refreshButton: document.getElementById("refreshButton"),
  saveFavoriteButton: document.getElementById("saveFavoriteButton"),
  searchResults: document.getElementById("searchResults"),
  unitSegment: document.getElementById("unitSegment"),
  placeTitle: document.getElementById("placeTitle"),
  heroEyebrow: document.getElementById("heroEyebrow"),
  heroSummary: document.getElementById("heroSummary"),
  heroTimestamp: document.getElementById("heroTimestamp"),
  heroTemp: document.getElementById("heroTemp"),
  metaGrid: document.getElementById("metaGrid"),
  highlightCards: document.getElementById("highlightCards"),
  watchoutList: document.getElementById("watchoutList"),
  hourlyGrid: document.getElementById("hourlyGrid"),
  dailyGrid: document.getElementById("dailyGrid"),
  airPanel: document.getElementById("airPanel"),
  alertStack: document.getElementById("alertStack"),
  favoriteList: document.getElementById("favoriteList"),
  favoritesCount: document.getElementById("favoritesCount"),
  aiOutput: document.getElementById("aiOutput"),
  sourceList: document.getElementById("sourceList"),
  providerSelect: document.getElementById("providerSelect"),
  modelInput: document.getElementById("modelInput"),
  baseUrlInput: document.getElementById("baseUrlInput"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  notesInput: document.getElementById("notesInput"),
  saveSettingsButton: document.getElementById("saveSettingsButton"),
  copyAiButton: document.getElementById("copyAiButton"),
  navGroup: document.getElementById("navGroup")
};

boot();

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function boot() {
  hydrateSettings();
  bindEvents();
  renderFavorites();
  activateUnitButtons();
  loadInitialLocation();
}

function bindEvents() {
  dom.searchButton.addEventListener("click", () => runSearch(dom.searchInput.value.trim()));
  dom.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runSearch(dom.searchInput.value.trim());
    }
  });
  dom.geoButton.addEventListener("click", useMyLocation);
  dom.refreshButton.addEventListener("click", () => {
    if (state.currentLocation) {
      loadWeather(state.currentLocation, { silent: false });
    }
  });
  dom.saveFavoriteButton.addEventListener("click", saveCurrentFavorite);
  dom.unitSegment.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-unit]");
    if (!button) {
      return;
    }
    state.units = button.dataset.unit;
    localStorage.setItem("weather.units", state.units);
    activateUnitButtons();
    renderWeather();
  });
  dom.saveSettingsButton.addEventListener("click", saveSettings);
  dom.copyAiButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(dom.aiOutput.textContent || "");
    dom.aiOutput.textContent = "AI output copied to clipboard.";
  });
  document.querySelectorAll("[data-ai-mode]").forEach((button) => {
    button.addEventListener("click", () => generateAiBriefing(button.dataset.aiMode));
  });
  dom.navGroup.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-target]");
    if (!button) {
      return;
    }
    document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function hydrateSettings() {
  dom.providerSelect.value = state.settings.provider || "gemini";
  dom.modelInput.value = state.settings.model || "";
  dom.baseUrlInput.value = state.settings.baseUrl || "";
  dom.apiKeyInput.value = state.settings.apiKey || "";
  dom.notesInput.value = state.settings.notes || "";
}

function saveSettings() {
  state.settings = {
    provider: dom.providerSelect.value,
    model: dom.modelInput.value.trim(),
    baseUrl: dom.baseUrlInput.value.trim(),
    apiKey: dom.apiKeyInput.value.trim(),
    notes: dom.notesInput.value.trim()
  };
  localStorage.setItem("weather.aiSettings", JSON.stringify(state.settings));
  dom.aiOutput.textContent = "Settings saved locally in this browser.";
}

function activateUnitButtons() {
  dom.unitSegment.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.unit === state.units);
  });
}

async function loadInitialLocation() {
  const pinned = state.favorites[0];

  if (pinned) {
    await loadWeather(pinned, { silent: true });
    return;
  }

  const response = await fetch("/api/search?q=Singapore");
  const payload = await response.json();
  const first = payload.results?.[0];

  if (first) {
    await loadWeather(first, { silent: true });
    return;
  }

  dom.aiOutput.textContent = "Search for a city to start the dashboard.";
}

async function runSearch(query) {
  if (!query) {
    return;
  }

  dom.searchResults.classList.add("open");
  dom.searchResults.innerHTML = '<button class="search-option">Searching…</button>';

  try {
    const response = await fetch("/api/search?q=" + encodeURIComponent(query));
    const results = await response.json();
    state.searchResults = results.results || [];

    if (state.searchResults.length === 1) {
      dom.searchResults.classList.remove("open");
      await loadWeather(state.searchResults[0], { silent: false });
      return;
    }

    renderSearchResults();
  } catch (error) {
    dom.searchResults.innerHTML = '<button class="search-option">Search failed: ' + escapeHtml(error.message) + "</button>";
  }
}

function renderSearchResults() {
  if (!state.searchResults.length) {
    dom.searchResults.innerHTML = '<button class="search-option">No results found.</button>';
    dom.searchResults.classList.add("open");
    return;
  }

  dom.searchResults.innerHTML = state.searchResults
    .map((item, index) =>
      '<button class="search-option" data-index="' + index + '">' +
      escapeHtml(item.name) +
      '<small>' +
      escapeHtml([item.admin1, item.country].filter(Boolean).join(", ")) +
      "</small></button>"
    )
    .join("");

  dom.searchResults.classList.add("open");
  dom.searchResults.querySelectorAll(".search-option[data-index]").forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.index);
      dom.searchResults.classList.remove("open");
      await loadWeather(state.searchResults[index], { silent: false });
    });
  });
}

async function useMyLocation() {
  if (!navigator.geolocation) {
    dom.aiOutput.textContent = "This browser does not expose geolocation.";
    return;
  }

  dom.aiOutput.textContent = "Finding your current location…";

  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const url = "/api/reverse?lat=" + encodeURIComponent(position.coords.latitude) + "&lon=" + encodeURIComponent(position.coords.longitude);
      const response = await fetch(url);
      const payload = await response.json();
      await loadWeather(payload.location, { silent: false });
    } catch (error) {
      dom.aiOutput.textContent = "Reverse geocoding failed: " + error.message;
    }
  }, (error) => {
    dom.aiOutput.textContent = "Location lookup failed: " + error.message;
  }, {
    enableHighAccuracy: true,
    timeout: 15000
  });
}

async function loadWeather(location, options = {}) {
  state.currentLocation = location;
  dom.placeTitle.textContent = location.name;
  dom.heroEyebrow.textContent = [location.admin1, location.country].filter(Boolean).join(", ");
  dom.heroSummary.textContent = "Loading weather signal…";
  dom.heroTemp.textContent = "--";

  try {
    const response = await fetch("/api/weather?payload=" + encodeURIComponent(JSON.stringify(location)));
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Weather request failed.");
    }

    state.currentWeather = payload;
    dom.searchResults.classList.remove("open");
    dom.searchInput.value = location.name;
    renderWeather();

    if (!options.silent) {
      dom.aiOutput.textContent = "Location loaded. Generate a briefing when you want the AI layer.";
    }
  } catch (error) {
    dom.aiOutput.textContent = "Weather load failed: " + error.message;
  }
}

function renderWeather() {
  const weather = state.currentWeather;

  if (!weather) {
    return;
  }

  dom.placeTitle.textContent = weather.location.name;
  dom.heroEyebrow.textContent = [weather.location.admin1, weather.location.country].filter(Boolean).join(", ");
  dom.heroSummary.textContent = weather.current.summary;
  dom.heroTimestamp.textContent = "Updated " + formatTimestamp(weather.source.refreshedAt);
  dom.heroTemp.textContent = formatTemp(weather.current.temperature_2m);
  renderMetaGrid(weather);
  renderHighlights(weather);
  renderHourly(weather);
  renderDaily(weather);
  renderAir(weather);
  renderAlerts(weather);
  renderSources(weather);
}

function renderMetaGrid(weather) {
  const cards = [
    ["Feels like", formatTemp(weather.current.apparent_temperature)],
    ["Humidity", Math.round(weather.current.relative_humidity_2m) + "%"],
    ["Wind", formatWind(weather.current.wind_speed_10m)],
    ["Visibility", formatVisibility(weather.current.visibility)],
    ["Pressure", Math.round(weather.current.pressure_msl) + " hPa"],
    ["UV index", roundMaybe(weather.current.uv_index)],
    ["Cloud cover", Math.round(weather.current.cloud_cover) + "%"],
    ["Gusts", formatWind(weather.current.wind_gusts_10m)]
  ];

  dom.metaGrid.innerHTML = cards.map(([label, value]) =>
    '<div class="meta-card"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + "</strong></div>"
  ).join("");
}

function renderHighlights(weather) {
  dom.highlightCards.innerHTML = weather.highlights.cards.map((card) =>
    '<div class="highlight-row"><strong>' + escapeHtml(card.title) + "</strong><div style=\"font-size:1.35rem;margin-top:8px;\">" +
    escapeHtml(card.value) +
    '</div><div class="muted" style="margin-top:6px;">' +
    escapeHtml(card.detail) +
    "</div></div>"
  ).join("");

  dom.watchoutList.innerHTML = weather.highlights.watchouts.map((item) =>
    '<div class="highlight-row">' + escapeHtml(item) + "</div>"
  ).join("");
}

function renderHourly(weather) {
  const points = weather.hourly.time.slice(0, 12).map((time, index) => ({
    time,
    temp: weather.hourly.temperature_2m[index],
    precip: weather.hourly.precipitation_probability[index] || 0,
    wind: weather.hourly.wind_speed_10m[index] || 0
  }));
  const maxTemp = Math.max(...points.map((item) => item.temp));

  dom.hourlyGrid.innerHTML = points.map((item) => {
    const fill = Math.max(22, Math.round((item.temp / maxTemp) * 120) + 26);
    return '<div class="hour-bar">' +
      '<div class="muted">' + escapeHtml(item.time.slice(11, 16)) + "</div>" +
      '<div class="hour-fill" style="height:' + fill + 'px;"></div>' +
      '<strong>' + escapeHtml(formatTemp(item.temp)) + '</strong>' +
      '<div class="muted">' + Math.round(item.precip) + '% rain</div>' +
      '<div class="muted">' + escapeHtml(formatWind(item.wind)) + "</div></div>";
  }).join("");
}

function renderDaily(weather) {
  const days = weather.daily.time.map((date, index) => ({
    date,
    label: weather.daily.summaries[index],
    tempMax: weather.daily.temperature_2m_max[index],
    tempMin: weather.daily.temperature_2m_min[index],
    precip: weather.daily.precipitation_probability_max[index],
    uv: weather.daily.uv_index_max[index],
    wind: weather.daily.wind_speed_10m_max[index]
  }));

  dom.dailyGrid.innerHTML = days.map((day) =>
    '<div class="daily-card"><span>' + escapeHtml(formatDay(day.date)) + "</span><strong>" +
    escapeHtml(day.label) +
    '</strong><div style="margin-top:10px;">' +
    escapeHtml(formatTemp(day.tempMin)) + " / " + escapeHtml(formatTemp(day.tempMax)) +
    '</div><div class="muted" style="margin-top:8px;">Rain ' + Math.round(day.precip || 0) +
    '%</div><div class="muted">UV ' + roundMaybe(day.uv) +
    '</div><div class="muted">Wind ' + escapeHtml(formatWind(day.wind)) + "</div></div>"
  ).join("");
}

function renderAir(weather) {
  const aqi = weather.airQuality.current?.us_aqi || 0;
  const left = Math.min(100, Math.max(4, (aqi / 300) * 100));

  dom.airPanel.innerHTML =
    '<div><strong style="font-size:1.65rem;">AQI ' + Math.round(aqi) + '</strong>' +
    '<div class="muted" style="margin-top:6px;">' +
    escapeHtml(weather.airQuality.currentLevel.label) +
    "</div></div>" +
    '<div class="aqi-meter"><div class="aqi-marker" style="left:' + left + '%;"></div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px;">' +
    renderMiniMetric("PM2.5", weather.airQuality.current?.pm2_5, "µg/m³") +
    renderMiniMetric("PM10", weather.airQuality.current?.pm10, "µg/m³") +
    renderMiniMetric("Ozone", weather.airQuality.current?.ozone, "µg/m³") +
    "</div>";
}

function renderAlerts(weather) {
  if (!weather.alerts.length) {
    dom.alertStack.innerHTML = '<div class="empty-state">No active alert feed for this location right now.</div>';
    return;
  }

  dom.alertStack.innerHTML = weather.alerts.map((alert) =>
    '<div class="alert-row"><strong>' + escapeHtml(alert.event || alert.headline || "Alert") +
    '</strong><div class="muted" style="margin-top:6px;">' +
    escapeHtml([alert.severity, alert.urgency].filter(Boolean).join(" • ")) +
    '</div><div style="margin-top:10px;">' +
    escapeHtml(alert.headline || alert.instruction || "") +
    "</div></div>"
  ).join("");
}

function renderFavorites() {
  dom.favoritesCount.textContent = state.favorites.length + " saved";

  if (!state.favorites.length) {
    dom.favoriteList.innerHTML = '<div class="empty-state">Save a few cities to turn this into a personal watch board.</div>';
    return;
  }

  dom.favoriteList.innerHTML = state.favorites.map((item, index) =>
    '<button class="favorite-chip" data-index="' + index + '"><strong>' + escapeHtml(item.name) +
    '</strong><span>' + escapeHtml([item.admin1, item.country].filter(Boolean).join(", ")) +
    "</span></button>"
  ).join("");

  dom.favoriteList.querySelectorAll(".favorite-chip").forEach((button) => {
    button.addEventListener("click", async () => {
      await loadWeather(state.favorites[Number(button.dataset.index)], { silent: false });
    });
  });
}

function saveCurrentFavorite() {
  if (!state.currentLocation) {
    return;
  }

  const id = state.currentLocation.id;
  state.favorites = [state.currentLocation, ...state.favorites.filter((item) => item.id !== id)].slice(0, 8);
  localStorage.setItem("weather.favorites", JSON.stringify(state.favorites));
  renderFavorites();
  dom.aiOutput.textContent = "Saved " + state.currentLocation.name + " to your watch list.";
}

function renderSources(weather) {
  dom.sourceList.innerHTML = [
    weather.source.forecast,
    weather.source.forecastAttribution,
    weather.source.alerts,
    "Last refresh: " + formatTimestamp(weather.source.refreshedAt)
  ].map((line) => '<div>' + escapeHtml(line) + "</div>").join("");
}

async function generateAiBriefing(mode) {
  if (!state.currentWeather) {
    dom.aiOutput.textContent = "Load a location before using the AI weather desk.";
    return;
  }

  dom.aiOutput.textContent = "Generating " + mode + "…";

  const response = await fetch("/api/ai/briefing", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      provider: dom.providerSelect.value,
      model: dom.modelInput.value.trim(),
      baseUrl: dom.baseUrlInput.value.trim(),
      apiKey: dom.apiKeyInput.value.trim(),
      mode,
      weather: state.currentWeather,
      notes: dom.notesInput.value.trim()
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    dom.aiOutput.textContent = payload.error || "AI request failed.";
    return;
  }

  dom.aiOutput.textContent = payload.content + "\\n\\nRoute: " + payload.route + " | Model: " + payload.model;
}

function renderMiniMetric(label, value, unit) {
  const safeValue = value === undefined || value === null ? "--" : Number(value).toFixed(1);
  return '<div class="meta-card"><span>' + escapeHtml(label) + '</span><strong>' + safeValue + " " + unit + "</strong></div>";
}

function formatTemp(value) {
  if (value === undefined || value === null) {
    return "--";
  }
  const number = state.units === "imperial" ? value * 9 / 5 + 32 : value;
  return Math.round(number) + "°" + (state.units === "imperial" ? "F" : "C");
}

function formatWind(value) {
  if (value === undefined || value === null) {
    return "--";
  }
  const number = state.units === "imperial" ? value * 0.621371 : value;
  return Math.round(number) + " " + (state.units === "imperial" ? "mph" : "km/h");
}

function formatVisibility(value) {
  if (value === undefined || value === null) {
    return "--";
  }
  if (state.units === "imperial") {
    return (value / 1609.34).toFixed(1) + " mi";
  }
  return (value / 1000).toFixed(1) + " km";
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatDay(value) {
  return new Date(value + "T00:00:00").toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function roundMaybe(value) {
  return value === undefined || value === null ? "--" : String(Math.round(value * 10) / 10);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
`;
