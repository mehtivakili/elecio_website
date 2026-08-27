import type { Knex } from 'knex';
import runtimeConfig from './knexfile';

const connection = process.env.DATABASE_MIGRATION_URL;

if (!connection) {
  throw new Error('DATABASE_MIGRATION_URL is required. Use a dedicated migrator account with schema privileges.');
}

const config: Knex.Config = { ...runtimeConfig, connection };

export default config;
