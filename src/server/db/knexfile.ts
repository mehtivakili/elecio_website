import type { Knex } from 'knex';
import path from 'node:path';

// Loaded by both the Knex CLI (via `-r dotenv/config` in package.json scripts) and by
// src/server/db/knex.ts at runtime inside Next.js Route Handlers.
//
// Deliberately does NOT throw when DATABASE_URL is missing: `next build` imports every Route
// Handler module to collect its config (without invoking the handler), so a top-level throw here
// breaks the production build even when no request ever touches the database. Missing/invalid
// credentials instead surface as a normal MySQL connection error the first time a query
// actually runs — later, but in the right place.
const connection = process.env.DATABASE_URL;

const config: Knex.Config = {
  client: 'mysql2',
  connection,
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    extension: 'ts',
    // MySQL implicitly commits DDL, so wrapping schema migrations in an outer transaction would
    // provide no atomicity and would break migrations that use their own transaction scope.
    disableTransactions: true,
  },
  pool: { min: 0, max: 10 },
};

export default config;
