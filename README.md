# Training Tracking

Personal training PWA: shows the weekly plan and tracks workout progress. Runs offline on iPhone as a home-screen app, no App Store or Apple Developer account needed.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | Markup only |
| `style.css` | Styles |
| `app.js` | App logic and the default plan data |
| `manifest.json` | Makes it installable (name, icon, fullscreen) |
| `sw.js` | Service worker for offline use |
| `icon-180/192/512.png`, `icon-512-maskable.png` | Home-screen / app-switcher icons *(not yet added — see below)* |
| `docs/SETUP.md` | Step-by-step guide: GitHub repo → GitHub Pages → install on iPhone |
| `docs/Trainingsplan_v6.md` | The underlying training plan and rationale (German) |

`index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`, and the icons must stay flat in the repo root — GitHub Pages serves from root and the paths inside `index.html`/`manifest.json`/`sw.js` assume no subfolder.

## Status

Icon files (`icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`) referenced by `manifest.json` and `sw.js` weren't part of the original export and still need to be added before install/offline caching works fully.

## Setup

See [`docs/SETUP.md`](docs/SETUP.md) for deploying to GitHub Pages and installing on an iPhone.

Data lives only in the device's local storage — nothing personal is stored in this repo. Back up regularly via **Daten → Als JSON exportieren** in the app.
