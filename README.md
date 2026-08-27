# Elecio Smart DNC — Website

Marketing website, blog, and lightweight admin for Elecio Smart DNC. Read
[`doc/plan.md`](./doc/plan.md) first — it's the authoritative technical plan (architecture
decisions, phases, page inventory). [`doc/journey.md`](./doc/journey.md) has the narrative log of
how the project got here. [`doc/business_path.md`](./doc/business_path.md) and
[`doc/marketing_path.md`](./doc/marketing_path.md) cover business and go-to-market decisions this
build depends on.

## Stack

Next.js (App Router, full-stack) · TypeScript · Ant Design · MySQL + Knex + Objection.js ·
next-intl (fa default/RTL + en) · Refine (admin, `/admin`, Phase 7) · React Three Fiber (hero,
Phase 3). Full rationale in `doc/plan.md` §2–3.

## Getting started

1. **Node 20+** and **MySQL 8.0.16+**. The minimum version matters because the schema uses
   enforced `CHECK` constraints.

2. Create a dedicated database and user for this project (do not run the app as `root`):

   ```sql
   CREATE DATABASE elecio_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   CREATE USER 'elecio_app'@'localhost' IDENTIFIED BY 'pick-a-real-password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON elecio_dev.* TO 'elecio_app'@'localhost';

   CREATE USER 'elecio_migrator'@'localhost' IDENTIFIED BY 'pick-another-real-password';
   GRANT ALL PRIVILEGES ON elecio_dev.* TO 'elecio_migrator'@'localhost';
   ```

3. Copy the env template and fill in both passwords. `DATABASE_URL` must use the restricted
   `elecio_app` account; `DATABASE_MIGRATION_URL` must use `elecio_migrator`. Keep `timezone=Z`
   and `charset=utf8mb4` in both connection URLs:

   ```
   cp .env.example .env
   ```

4. Install dependencies and run migrations. The migration script reads the separate privileged
   connection and never grants schema privileges to the runtime application account:

   ```sh
   npm install
   npm run db:migrate
   ```

   Migration `20260813000010` creates append-only audit triggers. On MySQL servers with binary
   logging enabled, an administrator may also need to grant the migrator global `SUPER` temporarily.
   Revoke it immediately afterward and reduce the migrator to the required schema privileges.
   Do not grant global `SUPER` access to the runtime application user.

5. For a local or staging test environment, seed all bundled demo content:

   ```sh
   NODE_ENV=development ALLOW_INSECURE_DEV_ADMIN=true npm run dev:seed-admin
   npm run content:seed-initial
   npm run content:import-en-ec-001
   npm run content:import-fa-ec-001
   ```

   The demo login is `admin@admin` / `admin`; never enable it in production.

   Verify the resulting schema and seeded row counts from the runtime connection:

   ```
   npm run db:verify:mysql
   ```

6. Start the dev server:

   ```
   npm run dev
   ```

> These migrations create a fresh MySQL schema. They do not copy rows from an existing PostgreSQL
> database; export/import existing production data separately before switching traffic.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Run pending Knex migrations with `DATABASE_MIGRATION_URL` (`src/server/db/migrations`) |
| `npm run db:migrate:rollback` | Roll back the last migration batch |
| `npm run db:migrate:make <name>` | Scaffold a new migration file |
| `npm run db:verify:mysql` | Verify MySQL connectivity, schema counts, UUID defaults, and audit triggers |
| `npm run dev:seed-admin` | Create the development-only owner login |
| `npm run content:seed-initial` | Seed the initial bilingual blog catalog |
| `npm run content:import-en-ec-001` / `content:import-fa-ec-001` | Import the bundled DOCX article content |

## Project layout

See `doc/plan.md` §5 for the full annotated structure. Short version: `src/app/[locale]/` holds
every public route (locale-prefixed, `fa`/`en`); `src/app/api/` holds Route Handlers (the "backend"
— see `doc/plan.md` D2); `src/server/db/` holds Knex migrations and Objection models; `old/` is the
previous site, kept as a reference for real product/company content, not as a code baseline.

## What's real vs. placeholder right now

Contact form (`/contact`) is fully wired end-to-end to MySQL — a genuine fix for the old site's
form, which only simulated submission client-side (see `doc/journey.md` 2026-08-06.01). Persona
pages, `/product`, `/software`, `/blog`, and `/about` are intentionally placeholder stubs (see each
page's note) pending content decisions tracked in `doc/plan.md` §6 and `doc/business_path.md`. The
homepage hero has no 3D scene yet — `doc/plan.md` Phase 3 has three concept candidates still
awaiting a decision.
