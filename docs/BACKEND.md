# Backend + Database

The frontend (`index.html`/`app.js`) is now a thin client: it reads and writes the whole app state — plan and logged workouts — through one REST API, `GET`/`PUT /api/state`, backed by Postgres. Postgres is the only source of truth; there's no local/offline copy of the data anymore.

## Quick start (Docker)

```bash
docker compose up --build
```

This starts Postgres and the backend together. Liquibase applies the schema automatically on startup. The API is then at `http://localhost:8080/api`.

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

Migrations are managed by [Liquibase](https://docs.liquibase.com/), which Spring Boot runs on
startup (`spring.liquibase` in `application.yml`):

| Path | Purpose |
|---|---|
| `db/changelog/db.changelog-master.xml` | Root changelog — no changesets of its own, just the ordered `<include>` list |
| `db/changelog/changes/001-init-schema.sql` | The whole schema in one changeset |
| `liquibase.properties` | Datasource for the `liquibase-maven-plugin` only; the app itself uses `application.yml` |

`001-init-schema.sql` is the flattened end state of the eight incremental Flyway migrations that
came before it, verified by diffing a database built from it against one built by replaying
V1–V8 — same tables, columns, constraints, indexes and seeded `session_types` ids. It's a
[formatted SQL changelog](https://docs.liquibase.com/concepts/changelogs/sql-format.html): plain
SQL apart from the `--changeset` marker comments, so it also runs on its own against an empty
database, without Liquibase in the picture at all:

```bash
psql -d training_tracking -f backend/src/main/resources/db/changelog/changes/001-init-schema.sql
```

What it creates:

- `users`, `refresh_tokens` — accounts; refresh tokens are stored hashed so they stay revocable.
- `days`, `blocks`, `exercises`, `warmup_items` — the training plan; every block belongs to exactly one day.
- `sessions`, `session_warmup`, `session_values` — logged workouts: one `sessions` row per date+day, with checked-off warmup items and per-set logged values hanging off it.
- `session_types`, `recurring_rules`, `recurring_rule_plans`, `recurring_rule_exceptions`, `planned_sessions` — the calendar: activity kinds, repeating series and the sessions they generate.

### Adding a change

Add a file under `db/changelog/changes/` and one `<include>` line to the master changelog. Do not
edit a changeset that has already been deployed — Liquibase stores a checksum per changeset in
`DATABASECHANGELOG` and refuses to start when a deployed one no longer matches.

Useful commands (they need `liquibase.properties` to point at the right database):

```bash
cd backend
./mvnw liquibase:status         # what would be applied
./mvnw liquibase:updateSQL      # print the DDL instead of running it
./mvnw liquibase:rollback -Dliquibase.rollbackCount=1
```

### Adopting it on a database that already has the schema

The baseline changeset carries a
[precondition](https://docs.liquibase.com/concepts/changelogs/preconditions.html) — "run only if
there is no `users` table" — with `onFail:MARK_RAN`. A database that was already migrated by Flyway
therefore records the changeset as run without re-executing it, and starting the backend is all it
takes. The leftover `flyway_schema_history` table is unused after that and can be dropped.

If you'd rather be explicit, `./mvnw liquibase:changelogSync` does the same marking without
starting the application.

Every `PUT /api/state` call replaces the entire contents of these tables in one transaction (the app always saves the whole state at once, so there's no partial-update path to reconcile). Deleting an exercise from the plan also deletes its historical logged values, since they no longer have anything valid to reference.

## Deploying for real use

This only covers local development. For anything beyond that you'll need to:
- Run Postgres somewhere durable (a managed instance is simplest) and set the `DB_*` variables accordingly.
- Build and run the backend as a normal Spring Boot jar (`./mvnw package` → `java -jar backend/target/tracking-backend-*.jar`) or the provided `backend/Dockerfile`, on a host reachable from wherever the frontend is served.
- Serve it over HTTPS if the frontend is served over HTTPS — browsers block mixed-content `fetch` calls from an HTTPS page to a plain `http://` API.
