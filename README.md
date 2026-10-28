# Cancha

Multi-tenant platform for running amateur sports tournaments end to end: online
registration, animated draw, multi-court scheduling, live standings and brackets,
and a TV display for the venue.

Next.js 16 (App Router) · React 19 · Payload CMS 3 · PostgreSQL · Tailwind 4 · TypeScript.

## Features

- **Formats:** groups + knockout (with classification matches), league (groups only), single elimination,
  double elimination (winners/losers brackets, grand final) and Swiss rounds.
- **15 sports** with their own scoring rules (goals, sets, points, fair-play
  tiebreakers): futsal, padel, tennis, volleyball, basketball, handball, hockey,
  rugby, badminton, squash, beach volley, water polo, table tennis, pétanque, darts.
- **Multi-tenant:** each organization gets its own subdomain or custom domain,
  branding (colors, fonts, radius, logo) and isolated data
  (`@payloadcms/plugin-multi-tenant`).
- **Organizer dashboard** (`/manage`): teams, payments, draw, schedule, score entry,
  referees, sponsors, TV screens.
- **Public views:** tournament page, "my team" view, live TV display and animated
  draw for a screen in the venue.
- **i18n:** French, Dutch and English (dictionary parity is unit-tested).
- **Staff console** (`/console`): leads and client onboarding for the platform owner.

## Architecture

```
app/
  (tournament)/[lang]/…   localized public site, tournament pages, /manage
  (console)/console       staff back-office (super-admin only)
  (payload)/admin         Payload admin UI + REST API
  api/tournament/…        tournament actions (draw, schedule, scores…)
proxy.ts                  redirects un-prefixed paths into a locale
src/lib/tournament/       pure tournament engine (bracket, schedule, standings,
                          Swiss, double-elim…) + orchestrator that persists it
src/lib/sport/            per-sport scoring profiles
src/payload/              collections, access control, hooks
src/i18n/                 dictionaries and helpers
```

The engine in `src/lib/tournament` is plain TypeScript with no framework
dependency, so it is unit-tested in isolation. `orchestrator.ts` is the only
layer that writes it to the database.

## Getting started

Requirements: Node 20+, pnpm, a PostgreSQL database.

```sh
pnpm install
cp .env.example .env    # fill in PAYLOAD_SECRET and DATABASE_URI at least
pnpm dev                # http://localhost:3000 · admin on /admin
```

In development Payload pushes the schema automatically. For production, schema
changes ship as migrations (see `src/migrations/README.md`).

## Quality checks

```sh
pnpm tsc --noEmit
pnpm lint
pnpm test        # Vitest: engine, sports, i18n parity
pnpm test:e2e    # Playwright against a throwaway local Postgres (see tests/e2e/README.md)
```

Do not run `pnpm build` while `pnpm dev` is running.

## Live demo

Setting `DEMO_ENABLED=true` turns on a public demo organization with published
credentials and a reset endpoint. Only enable it on a deployment meant to be a
public demo.
