# Training Tracking

Personal training PWA: shows the weekly plan and tracks workout progress. Installs on iPhone as a home-screen app, no App Store or Apple Developer account needed. Requires a network connection — the plan and logged workouts live in a Postgres database behind a small Java backend, not on the device.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | Markup only |
| `style.css` | Styles |
| `app.js` | App logic and the default plan data |
| `manifest.json` | Makes it installable (name, icon, fullscreen) |
| `sw.js` | Service worker — caches the app shell, not the API |
| `icon-180/192/512.png`, `icon-512-maskable.png` | Home-screen / app-switcher icons |
| `backend/` | Java (Spring Boot) REST API + Postgres schema — see [`docs/BACKEND.md`](docs/BACKEND.md) |
| `docker-compose.yml` | Local dev stack: Postgres + backend |
| `docs/SETUP.md` | Step-by-step guide: GitHub repo → GitHub Pages → install on iPhone |
| `docs/BACKEND.md` | Running and configuring the backend + database |
| `docs/Trainingsplan_v6.md` | The underlying training plan and rationale (German) |

`index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`, and the icons must stay flat in the repo root — GitHub Pages serves from root and the paths inside `index.html`/`manifest.json`/`sw.js` assume no subfolder.

## Setup

1. Start the backend: see [`docs/BACKEND.md`](docs/BACKEND.md) (quickest path is `docker compose up --build`).
2. Serve/deploy the frontend and point it at the backend: see [`docs/SETUP.md`](docs/SETUP.md).

Data lives in the Postgres database the backend is configured against — nothing personal is stored in this repo. You can still back up via **Daten → Als JSON exportieren** in the app; that exports whatever the backend currently holds.
