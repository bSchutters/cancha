# Database migrations

Schema changes go through reviewed migration files (`push: false` in
`payload.config.ts`), applied with `pnpm migrate`.

## Bootstrapping a brand-new (empty) database

The migrations in this folder are **deltas** — they `ALTER` existing tables.
They assume the base schema (the 19 collection tables Payload derives from the
config) already exists. There is intentionally **no hand-written baseline**: the
only authoritative source for the full schema is Payload's own generator, and a
hand-rolled one would drift from what Payload expects.

So for a fresh, empty database, create the tables first, then run the deltas:

1. Generate the schema once, either by booting with auto-push on a throwaway run
   (`push: true` in the postgres adapter), **or** generate a real baseline
   migration with the Payload CLI:

   ```sh
   pnpm migrate:create baseline   # writes src/migrations/<ts>_baseline.ts
   ```

2. Then apply everything:

   ```sh
   pnpm migrate
   ```

> The Payload CLI (`pnpm migrate:create` / `pnpm migrate`) needs a clean Node +
> `tsx` setup that can resolve the `@/*` tsconfig paths when loading
> `payload.config.ts`. If it can't run locally, run it in CI or a container with
> Node 22+.

## The current shared database

The existing Supabase database is **already provisioned** (it carries Payload's
`dev` marker row in `payload_migrations` from earlier auto-push). It does not
need a baseline — only the deltas. `pnpm migrate` applies any not-yet-recorded
delta and skips the rest.

## Delta authoring notes

Make `up()` idempotent so a re-run or replay-after-partial-failure is a no-op,
not a hard error — e.g. `ADD COLUMN IF NOT EXISTS`, and guard `CREATE TYPE`
(which has no `IF NOT EXISTS`) with a `DO $$ … EXCEPTION WHEN duplicate_object`
block. See `20260626_000000_add_org_default_locales.ts`.
