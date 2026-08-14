import Knex from 'knex';
import knexConfig from './knexfile';

// Next.js hot-reloads server modules in dev, which would otherwise open a fresh pool of
// MySQL connections on every edit. Cache the instance on `globalThis` the same way the
// common Prisma-in-Next.js pattern does, just for Knex instead.
declare global {
  var __elecioKnex: ReturnType<typeof Knex> | undefined;
}

export const knex = globalThis.__elecioKnex ?? Knex(knexConfig);

if (process.env.NODE_ENV !== 'production') {
  globalThis.__elecioKnex = knex;
}
