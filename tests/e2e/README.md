# End-to-end tests (Playwright, hermetic)

These tests run the **real app** against a **throwaway local Postgres** — they
never touch the shared Supabase database.

## How it works

```
scripts/e2e-pg.sh        → starts a local Postgres on 127.0.0.1:55432
playwright global-setup  → drops + recreates the `cancha_test` database
playwright webServer      → boots `next dev` on :3100 with DATABASE_URI pointing
                            at cancha_test and NODE_ENV=development, so Payload
                            `push` auto-creates the schema on first request
specs                     → seed fixtures (admin user) via SQL, then drive the UI
```

The password hashing in `db.ts` matches Payload exactly
(`pbkdf2(pw, salt, 25000, 512, 'sha256')`), so seeded users can log in.

## Run

```sh
pnpm test:e2e            # starts local PG, runs Playwright
# first time only, if the browser isn't cached:
pnpm exec playwright install chromium
```

Requirements:
- local Postgres client tools (`initdb`, `pg_ctl`) — e.g. `brew install postgresql@16`
- **no other `next dev` running** (Next 16 allows a single dev server per project)

## Status

The infrastructure is validated end to end (local PG → isolated server → schema
push → SQL seed → REST login with token). The login smoke test in
`padel.spec.ts` exercises the full stack through the UI. The full padel
set-by-set flow is scaffolded (`test.skip`) — pin its selectors against the
running app to enable it.
