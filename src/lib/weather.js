import { fetchJson, withQuery } from "./http.js";

const WEATHER_CODES = {
  0: { label: "Clear", icon: "sunny" },
  1: { label: "Mostly clear", icon: "sunny" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Freezing fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Dense drizzle", icon: "drizzle" },
  56: { label: "Freezing drizzle", icon: "drizzle" },
  57: { label: "Dense freezing drizzle", icon: "drizzle" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Freezing rain", icon: "rain" },
  67: { label: "Heavy freezing rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Rain showers", icon: "showers" },
  81: { label: "Frequent showers", icon: "showers" },
  82: { label: "Intense showers", icon: "showers" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Heavy snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm and hail", icon: "storm" },
  99: { label: "Severe thunderstorm", icon: "storm" }
};

function weatherLabel(code) {
  return WEATHER_CODES[code] || { label: "Unspecified", icon: "cloud" };
}

function computeAirQualityLevel(aqi) {
  if (aqi === null || aqi === undefined) {
    return { label: "Unavailable", tone: "muted" };
  }
  if (aqi <= 50) {
    return { label: "Good", tone: "good" };
  }
  if (aqi <= 100) {
    return { label: "Moderate", tone: "moderate" };
  }
  if (aqi <= 150) {
    return { label: "Sensitive groups", tone: "elevated" };
  }
  if (aqi <= 200) {
    return { label: "Unhealthy", tone: "warning" };
  }
  if (aqi <= 300) {
    return { label: "Very unhealthy", tone: "danger" };
  }
  return { label: "Hazardous", tone: "danger" };
}

function pickNextRainWindow(hourly) {
  for (let index = 0; index < Math.min(hourly.time.length, 24); index += 1) {
    if ((hourly.precipitation_probability?.[index] || 0) >= 45 || (hourly.precipitation?.[index] || 0) >= 1) {
      return {
        time: hourly.time[index],
        probability: hourly.precipitation_probability?.[index] || 0,
        precipitation: hourly.precipitation?.[index] || 0
      };
    }
  }

  return null;
}

function pickBestWindow(hourly) {
  let best = null;

  for (let index = 0; index < Math.min(hourly.time.length, 12); index += 1) {
    const temp = hourly.temperature_2m?.[index] ?? 0;
    const precip = hourly.precipitation_probability?.[index] ?? 0;
    const wind = hourly.wind_speed_10m?.[index] ?? 0;
    const uv = hourly.uv_index?.[index] ?? 0;
    const score = 100 - precip * 0.9 - Math.max(0, temp - 29) * 2 - wind * 0.4 - Math.max(0, uv - 6) * 4;

    if (!best || score > best.score) {
      best = {
        score,
        time: hourly.time[index],
        temp,
        precip,
        wind
      };
    }
  }

  return best;
}

function buildHighlights({ current, hourly, daily, airQuality }) {
  const rainWindow = pickNextRainWindow(hourly);
  const bestWindow = pickBestWindow(hourly);
  const aqi = airQuality?.current?.us_aqi ?? null;
  const airLabel = computeAirQualityLevel(aqi);
  const todayHigh = daily.temperature_2m_max?.[0] ?? current.temperature_2m;
  const todayLow = daily.temperature_2m_min?.[0] ?? current.temperature_2m;

  const cards = [
    {
      title: "Outdoor window",
      value: bestWindow ? bestWindow.time.slice(11, 16) : "Flexible",
      detail: bestWindow
        ? `${Math.round(bestWindow.temp)}°C with ${Math.round(bestWindow.precip)}% rain risk`
        : "Conditions stay fairly even for the next few hours."
    },
    {
      title: "Rain watch",
      value: rainWindow ? rainWindow.time.slice(11, 16) : "Clear runway",
      detail: rainWindow
        ? `${Math.round(rainWindow.probability)}% chance, around ${rainWindow.precipitation.toFixed(1)} mm`
        : "No meaningful precipitation signal in the next 24 hours."
    },
    {
      title: "Air quality",
      value: aqi === null ? "Unavailable" : `AQI ${Math.round(aqi)}`,
      detail: airLabel.label
    },
    {
      title: "Temperature spread",
      value: `${Math.round(todayLow)}° - ${Math.round(todayHigh)}°`,
      detail: `Feels like ${Math.round(current.apparent_temperature)}° right now`
    }
  ];

  const watchouts = [];

  if ((current.wind_gusts_10m || 0) >= 45) {
    watchouts.push("Wind gusts are high enough to affect lightweight outdoor plans.");
  }
  if ((daily.uv_index_max?.[0] || 0) >= 8) {
    watchouts.push("UV exposure peaks hard today, so shade and sun protection matter.");
  }
  if ((current.apparent_temperature || 0) >= 34) {
    watchouts.push("Heat stress risk is elevated, especially during mid-day.");
  }
  if (airLabel.tone === "warning" || airLabel.tone === "danger") {
    watchouts.push("Air quality is poor enough to justify limiting long outdoor sessions.");
  }
  if (!watchouts.length) {
    watchouts.push("No major operational red flags are standing out right now.");
  }

  return { cards, watchouts };
}

async function fetchForecast(lat, lon, timezone) {
  const url = withQuery("https://api.open-meteo.com/v1/forecast", {
    latitude: lat,
    longitude: lon,
    timezone: timezone || "auto",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "surface_pressure",
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
      "uv_index",
      "visibility"
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "relative_humidity_2m",
      "surface_pressure",
      "cloud_cover",
      "visibility",
      "uv_index",
      "wind_speed_10m",
      "wind_gusts_10m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "rain_sum",
      "showers_sum",
      "snowfall_sum",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset"
    ].join(","),
    forecast_days: 7
  });

  return fetchJson(url);
}

async function fetchAirQuality(lat, lon, timezone) {
  const url = withQuery("https://air-quality-api.open-meteo.com/v1/air-quality", {
    latitude: lat,
    longitude: lon,
    timezone: timezone || "auto",
    current: ["us_aqi", "pm2_5", "pm10", "ozone", "nitrogen_dioxide", "sulphur_dioxide"].join(","),
    hourly: ["us_aqi", "pm2_5", "ozone"].join(",")
  });

  return fetchJson(url);
}

async function fetchUsAlerts(lat, lon) {
  const url = withQuery("https://api.weather.gov/alerts/active", {
    point: `${lat},${lon}`
  });

  try {
    const result = await fetchJson(url, {
      headers: {
        Accept: "application/geo+json",
        "User-Agent": "weather-command-center/1.0"
      }
    });

    return (result.features || []).map((feature) => ({
      id: feature.id,
      event: feature.properties?.event,
      severity: feature.properties?.severity,
      certainty: feature.properties?.certainty,
      urgency: feature.properties?.urgency,
      headline: feature.properties?.headline,
      areaDesc: feature.properties?.areaDesc,
      effective: feature.properties?.effective,
      expires: feature.properties?.expires,
      instruction: feature.properties?.instruction
    }));
  } catch (error) {
    return [{ id: "nws-unavailable", event: "Alerts unavailable", severity: "Unknown", headline: error.message }];
  }
}

export async function searchLocations(query) {
  const url = withQuery("https://geocoding-api.open-meteo.com/v1/search", {
    name: query,
    count: 8,
    language: "en",
    format: "json"
  });

  const result = await fetchJson(url);

  return (result.results || []).map((item) => ({
    id: `${item.latitude},${item.longitude}:${item.name}`,
    name: item.name,
    country: item.country,
    countryCode: item.country_code,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone
  }));
}

export async function reverseLocation(lat, lon) {
  const url = withQuery("https://geocoding-api.open-meteo.com/v1/reverse", {
    latitude: lat,
    longitude: lon,
    count: 1,
    language: "en",
    format: "json"
  });

  const result = await fetchJson(url);
  const item = result.results?.[0];

  if (!item) {
    return {
      id: `${lat},${lon}:Current location`,
      name: "Current location",
      country: "",
      countryCode: "",
      admin1: "",
      latitude: lat,
      longitude: lon,
      timezone: "auto"
    };
  }

  return {
    id: `${item.latitude},${item.longitude}:${item.name}`,
    name: item.name,
    country: item.country,
    countryCode: item.country_code,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone
  };
}

export async function fetchWeatherBundle(location) {
  const [forecast, airQuality, alerts] = await Promise.all([
    fetchForecast(location.latitude, location.longitude, location.timezone),
    fetchAirQuality(location.latitude, location.longitude, location.timezone),
    location.countryCode === "US" ? fetchUsAlerts(location.latitude, location.longitude) : Promise.resolve([])
  ]);

  const currentWeather = weatherLabel(forecast.current.weather_code);
  const dailyCodes = (forecast.daily.weather_code || []).map((code) => weatherLabel(code));
  const highlights = buildHighlights({
    current: forecast.current,
    hourly: forecast.hourly,
    daily: forecast.daily,
    airQuality
  });

  return {
    location,
    source: {
      forecast: "Open-Meteo forecast service",
      forecastAttribution: "Open-Meteo blends major numerical models such as ECMWF and NOAA for global coverage.",
      alerts: location.countryCode === "US" ? "NOAA / National Weather Service alerts" : "No local alert feed configured for this country",
      refreshedAt: new Date().toISOString()
    },
    current: {
      ...forecast.current,
      summary: currentWeather.label,
      icon: currentWeather.icon
    },
    hourly: forecast.hourly,
    daily: {
      ...forecast.daily,
      summaries: dailyCodes.map((item) => item.label),
      icons: dailyCodes.map((item) => item.icon)
    },
    airQuality: {
      ...airQuality,
      currentLevel: computeAirQualityLevel(airQuality.current?.us_aqi)
    },
    alerts,
    highlights
  };
}
