import type { Knex } from 'knex';

const AUTH_TABLES = ['auth_users', 'auth_sessions', 'auth_accounts', 'auth_verifications', 'auth_two_factors'] as const;

export async function up(knex: Knex): Promise<void> {
  for (const table of AUTH_TABLES) {
    await knex.raw(`alter table ?? modify column id char(36) not null default (uuid())`, [table]);
  }
}

export async function down(knex: Knex): Promise<void> {
  for (const table of AUTH_TABLES) {
    await knex.raw(`alter table ?? alter column id drop default`, [table]);
  }
}
