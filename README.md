# Cup Generator

Standalone futsal tournament management platform (extracted from the UD Asturiana club site).
Next.js 16 + Payload CMS 3 + PostgreSQL. Multi-tenant (per-organizer branding) is being added incrementally.

## Status

- **Phase 0 (done):** standalone single-tenant app. The tournament engine, collections, public/TV
  views and the management dashboard run on their own (no club coupling). Routes are served at the
  root (`/`, `/[slug]`, `/[slug]/tv`, `/manage`, `/admin`).
- **Next:** organizations + per-tenant data isolation, host-based tenant resolution, per-org branding.

## Setup

1. `pnpm install`
2. Copy `.env.example` to `.env` and fill it in (a **new** Postgres DB + Vercel Blob store, separate
   from any other project).
3. `pnpm dev` — app on http://localhost:3000, Payload admin on http://localhost:3000/admin.

## Validate (never run `pnpm build` while `pnpm dev` is running)

- `pnpm tsc --noEmit`
- `pnpm lint`
- `pnpm test` (tournament engine unit tests)

## Routes

- `/` — tournaments list (public)
- `/[slug]` — public tournament page · `/[slug]/tv` — TV display · `/[slug]/tv/draw` — animated draw
- `/login` · `/manage` · `/manage/[slug]/...` — organizer dashboard
- `/admin` — Payload admin
