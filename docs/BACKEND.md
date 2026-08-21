# Backend + Database

The frontend (`index.html`/`app.js`) is now a thin client: it reads and writes the whole app state — plan and logged workouts — through one REST API, `GET`/`PUT /api/state`, backed by Postgres. Postgres is the only source of truth; there's no local/offline copy of the data anymore.

## Quick start (Docker)

```bash
docker compose up --build
```

This starts Postgres and the backend together. Flyway applies the schema automatically on startup. The API is then at `http://localhost:8080/api`.

## Running without Docker

Requires Java 21 and a running Postgres instance.

```bash
cd backend
createdb training_tracking   # or point DB_* env vars at an existing instance
./mvnw spring-boot:run
```

### Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `DB_HOST` | `localhost` | Postgres host |
| `DB_PORT` | `5432` | Postgres port |
| `DB_NAME` | `training_tracking` | Database name |
| `DB_USER` | `training` | Database user |
| `DB_PASSWORD` | `training` | Database password |
| `SERVER_PORT` | `8080` | Port the API listens on |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5500,http://127.0.0.1:5500` | Comma-separated origins allowed to call the API from a browser |

## Pointing the frontend at the backend

The frontend calls `window.API_BASE` if it's set before the app loads, otherwise `VITE_API_BASE` at build time, otherwise it defaults to `http://localhost:8080/api`. For a deployed build, set `window.API_BASE` in `index.html` — it just needs to run before `main.tsx`, so anywhere in `<head>` works:

```html
<script>window.API_BASE = 'https://your-backend-host/api';</script>
```

And add the frontend's origin to `CORS_ALLOWED_ORIGINS` on the backend. The local dev server (`npm run dev`) runs on `http://localhost:5500`, which is already in the default allowlist below.

## Schema

The schema (`backend/src/main/resources/db/migration/V1__init_schema.sql`, applied via Flyway) mirrors the plan/log structure the app already used:

- `days`, `blocks`, `exercises`, `warmup_items` — the training plan; every block belongs to exactly one day.
- `sessions`, `session_warmup`, `session_values` — logged workouts: one `sessions` row per date+day, with checked-off warmup items and per-set logged values hanging off it.

Every `PUT /api/state` call replaces the entire contents of these tables in one transaction (the app always saves the whole state at once, so there's no partial-update path to reconcile). Deleting an exercise from the plan also deletes its historical logged values, since they no longer have anything valid to reference.

## Deploying for real use

This only covers local development. For anything beyond that you'll need to:
- Run Postgres somewhere durable (a managed instance is simplest) and set the `DB_*` variables accordingly.
- Build and run the backend as a normal Spring Boot jar (`./mvnw package` → `java -jar backend/target/tracking-backend-*.jar`) or the provided `backend/Dockerfile`, on a host reachable from wherever the frontend is served.
- Serve it over HTTPS if the frontend is served over HTTPS — browsers block mixed-content `fetch` calls from an HTTPS page to a plain `http://` API.
