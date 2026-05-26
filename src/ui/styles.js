export const APP_CSS = String.raw`
:root {
  color-scheme: dark;
  --bg: #07111e;
  --surface: rgba(10, 19, 34, 0.76);
  --surface-strong: rgba(8, 15, 28, 0.92);
  --surface-soft: rgba(17, 32, 56, 0.55);
  --line: rgba(142, 183, 255, 0.16);
  --text: #f3f7ff;
  --muted: #a4b6d2;
  --accent: #67d7ff;
  --accent-2: #ffd36b;
  --danger: #ff7b7b;
  --good: #74f0b7;
  --warning: #ffb65a;
  --shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
  --radius: 18px;
  --content-width: min(1480px, calc(100vw - 48px));
  font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at 20% 20%, rgba(91, 176, 255, 0.22), transparent 34%),
    radial-gradient(circle at 80% 0%, rgba(255, 190, 92, 0.16), transparent 28%),
    linear-gradient(180deg, #0a1527 0%, #060c15 100%);
  color: var(--text);
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.48), transparent 94%);
  pointer-events: none;
}

a {
  color: inherit;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  width: var(--content-width);
  min-height: 100svh;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 22px;
  padding: 24px 0;
}

.sidebar,
.content,
.panel,
.search-results,
.ai-output,
.favorites-dock {
  backdrop-filter: blur(18px);
}

.sidebar {
  position: sticky;
  top: 24px;
  align-self: start;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(9, 18, 33, 0.92), rgba(9, 18, 33, 0.72));
  box-shadow: var(--shadow);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(103, 215, 255, 0.25), rgba(255, 211, 107, 0.16));
  border: 1px solid rgba(255,255,255,0.12);
  font-weight: 700;
}

.brand-copy strong {
  display: block;
  font-size: 1.05rem;
}

.brand-copy span {
  color: var(--muted);
  font-size: 0.9rem;
}

.nav-group {
  display: grid;
  gap: 10px;
  margin-bottom: 24px;
}

.nav-button,
.ghost-button,
.primary-button,
.segment button,
.favorite-chip,
.quick-action {
  border: 1px solid transparent;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  color: var(--text);
  cursor: pointer;
  transition: transform 150ms ease, border-color 150ms ease, background 150ms ease, opacity 150ms ease;
}

.nav-button:hover,
.ghost-button:hover,
.primary-button:hover,
.segment button:hover,
.favorite-chip:hover,
.quick-action:hover {
  transform: translateY(-1px);
  border-color: rgba(103, 215, 255, 0.28);
}

.nav-button {
  padding: 12px 14px;
  text-align: left;
  color: var(--muted);
}

.nav-button.active {
  color: var(--text);
  background: linear-gradient(135deg, rgba(103, 215, 255, 0.16), rgba(255, 211, 107, 0.09));
  border-color: rgba(103, 215, 255, 0.28);
}

.sidebar-meta {
  display: grid;
  gap: 10px;
  color: var(--muted);
  font-size: 0.92rem;
}

.sidebar-meta strong {
  color: var(--text);
  display: block;
  margin-bottom: 4px;
}

.content {
  display: grid;
  gap: 20px;
}

.topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 28px;
  border: 1px solid var(--line);
  background: rgba(6, 14, 25, 0.8);
  box-shadow: var(--shadow);
}

.search-wrap {
  position: relative;
}

.search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
}

.search-input,
.provider-select,
.text-input,
.textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  color: var(--text);
  padding: 14px 16px;
  min-width: 0;
}

.search-results {
  position: absolute;
  inset: calc(100% + 10px) 0 auto 0;
  display: none;
  background: rgba(8, 17, 30, 0.96);
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  z-index: 10;
}

.search-results.open {
  display: block;
}

.search-option {
  width: 100%;
  padding: 13px 16px;
  background: transparent;
  border: 0;
  color: var(--text);
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.search-option small {
  display: block;
  color: var(--muted);
  margin-top: 4px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.segment {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 6px;
  padding: 5px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}

.segment button {
  padding: 10px 12px;
}

.segment button.active,
.primary-button {
  background: linear-gradient(135deg, rgba(103, 215, 255, 0.25), rgba(255, 211, 107, 0.18));
  border-color: rgba(103, 215, 255, 0.28);
}

.ghost-button,
.primary-button,
.quick-action {
  padding: 12px 14px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
  gap: 20px;
}

.panel {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.panel-inner {
  padding: 22px;
}

.hero-panel {
  min-height: 420px;
}

.hero-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 75% 25%, rgba(255, 211, 107, 0.22), transparent 28%),
    radial-gradient(circle at 22% 20%, rgba(103, 215, 255, 0.2), transparent 32%),
    linear-gradient(160deg, rgba(255,255,255,0.03), rgba(255,255,255,0));
  pointer-events: none;
}

.hero-header,
.meta-grid,
.hourly-grid,
.panel-grid,
.daily-grid,
.settings-grid {
  display: grid;
  gap: 16px;
}

.hero-header {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  margin-bottom: 26px;
}

.eyebrow,
.muted {
  color: var(--muted);
}

.place-title {
  margin: 8px 0 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 0.96;
  letter-spacing: 0;
}

.hero-temp {
  font-size: clamp(4rem, 8vw, 6.2rem);
  line-height: 0.95;
  font-weight: 700;
}

.hero-summary {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 1.05rem;
  color: var(--muted);
  margin-top: 10px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
}

.meta-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.meta-card,
.daily-card,
.air-band,
.alert-row,
.highlight-row,
.setting-block {
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.035);
}

.meta-card {
  padding: 16px;
}

.meta-card span,
.section-title small,
.setting-block label,
.list-table th {
  color: var(--muted);
}

.meta-card strong {
  display: block;
  font-size: 1.35rem;
  margin-top: 8px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 18px;
}

.panel-head h2,
.section-title h2 {
  margin: 0;
  font-size: 1.2rem;
}

.hourly-grid {
  grid-template-columns: repeat(12, minmax(64px, 1fr));
  align-items: end;
}

.hour-bar {
  min-height: 180px;
  padding: 12px 10px;
  display: grid;
  align-content: end;
  gap: 10px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(103, 215, 255, 0.07));
  border: 1px solid rgba(255,255,255,0.06);
}

.hour-fill {
  width: 100%;
  border-radius: 999px 999px 14px 14px;
  background: linear-gradient(180deg, rgba(103, 215, 255, 0.95), rgba(103, 215, 255, 0.22));
}

.panel-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.daily-grid {
  grid-template-columns: repeat(7, minmax(110px, 1fr));
}

.daily-card {
  padding: 16px;
}

.daily-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1.05rem;
}

.list-table {
  width: 100%;
  border-collapse: collapse;
}

.list-table th,
.list-table td {
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  text-align: left;
  font-size: 0.95rem;
}

.air-band {
  padding: 18px;
}

.aqi-meter {
  margin-top: 16px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #57e6a7 0%, #d7f26a 32%, #ffbf59 60%, #ff6d6d 100%);
  position: relative;
}

.aqi-marker {
  position: absolute;
  top: -6px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid #07111e;
  background: #fff;
  transform: translateX(-50%);
}

.alert-stack,
.watchout-list,
.favorite-list,
.quick-actions,
.source-list {
  display: grid;
  gap: 10px;
}

.alert-row,
.highlight-row,
.setting-block,
.ai-output {
  padding: 16px;
}

.favorite-list {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.favorite-chip {
  padding: 12px 14px;
  text-align: left;
}

.favorite-chip strong,
.favorite-chip span {
  display: block;
}

.favorite-chip span {
  color: var(--muted);
  margin-top: 4px;
  font-size: 0.9rem;
}

.favorites-dock {
  padding: 20px 22px;
  border-radius: 28px;
  border: 1px solid var(--line);
  background: rgba(7, 15, 28, 0.78);
  box-shadow: var(--shadow);
}

.settings-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.setting-block {
  display: grid;
  gap: 10px;
}

.textarea {
  min-height: 140px;
  resize: vertical;
}

.ai-output {
  min-height: 260px;
  white-space: pre-wrap;
  line-height: 1.6;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
}

.quick-actions {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.source-list {
  font-size: 0.95rem;
  color: var(--muted);
}

.empty-state {
  color: var(--muted);
  padding: 20px 0;
}

.tone-good { color: var(--good); }
.tone-moderate { color: #d4ef79; }
.tone-elevated { color: var(--warning); }
.tone-warning,
.tone-danger { color: var(--danger); }

@media (max-width: 1180px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .dashboard-grid,
  .panel-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  :root {
    --content-width: min(100vw, calc(100vw - 20px));
  }

  .app-shell {
    padding: 10px 0 20px;
    gap: 12px;
  }

  .sidebar,
  .topbar,
  .panel,
  .favorites-dock {
    border-radius: 22px;
  }

  .meta-grid,
  .daily-grid,
  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hourly-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .hero-header,
  .search-row {
    grid-template-columns: 1fr;
  }

  .toolbar {
    justify-content: space-between;
  }
}

@media (max-width: 560px) {
  .meta-grid,
  .daily-grid,
  .quick-actions,
  .favorite-list {
    grid-template-columns: 1fr;
  }

  .hourly-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
`;
