# Elecio Smart DNC — Website

Marketing website, blog, and lightweight admin for Elecio Smart DNC. Read
[`doc/plan.md`](./doc/plan.md) first — it's the authoritative technical plan (architecture
decisions, phases, page inventory). [`doc/journey.md`](./doc/journey.md) has the narrative log of
how the project got here. [`doc/business_path.md`](./doc/business_path.md) and
[`doc/marketing_path.md`](./doc/marketing_path.md) cover business and go-to-market decisions this
build depends on.

## Stack

Next.js (App Router, full-stack) · TypeScript · Ant Design · PostgreSQL + Knex + Objection.js ·
next-intl (fa default/RTL + en) · Refine (admin, `/admin`, Phase 7) · React Three Fiber (hero,
Phase 3). Full rationale in `doc/plan.md` §2–3.

## Getting started

1. **Node 20+** and a local **PostgreSQL** server (this repo was set up against a local
   `postgresql-x64-17` Windows service — any Postgres 14+ works).

2. Create a dedicated database and role for this project (don't reuse `postgres`/superuser).
   **Already done on the original dev machine** — `elecio_app`/`elecio_dev`, see
   `doc/journey.md` 2026-08-06.04 for how. On a fresh machine, run as the `postgres` superuser:

   ```sql
   CREATE ROLE elecio_app WITH LOGIN PASSWORD 'pick-a-real-password';
   CREATE DATABASE elecio_dev OWNER elecio_app;
   ```

3. Copy the env template and fill in the password you used above:

   ```
   cp .env.example .env
   ```

4. Install dependencies and run migrations:

   ```
   npm install
   npm run db:migrate
   ```

5. Start the dev server:

   ```
   npm run dev
   ```

> Local-only note: this project's `.env` currently uses `1234` as the `elecio_app` password —
> deliberate, per the owner's preference to avoid managing a separate local secret, and safe only
> because this Postgres instance never leaves the local machine. **Never reuse it for a hosted
> database.**

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Run pending Knex migrations (`src/server/db/migrations`) |
| `npm run db:migrate:rollback` | Roll back the last migration batch |
| `npm run db:migrate:make <name>` | Scaffold a new migration file |

## Project layout

See `doc/plan.md` §5 for the full annotated structure. Short version: `src/app/[locale]/` holds
every public route (locale-prefixed, `fa`/`en`); `src/app/api/` holds Route Handlers (the "backend"
— see `doc/plan.md` D2); `src/server/db/` holds Knex migrations and Objection models; `old/` is the
previous site, kept as a reference for real product/company content, not as a code baseline.

## What's real vs. placeholder right now

Contact form (`/contact`) is fully wired end-to-end to Postgres — a genuine fix for the old site's
form, which only simulated submission client-side (see `doc/journey.md` 2026-08-06.01). Persona
pages, `/product`, `/software`, `/blog`, and `/about` are intentionally placeholder stubs (see each
page's note) pending content decisions tracked in `doc/plan.md` §6 and `doc/business_path.md`. The
homepage hero has no 3D scene yet — `doc/plan.md` Phase 3 has three concept candidates still
awaiting a decision.
