import type { Knex } from 'knex';

const AUTH_TABLES = ['auth_users', 'auth_sessions', 'auth_accounts', 'auth_verifications', 'auth_two_factors'] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    for (const table of AUTH_TABLES) {
      await trx.raw(`alter table ?? alter column id set default gen_random_uuid()`, [table]);
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    for (const table of AUTH_TABLES) {
      await trx.raw(`alter table ?? alter column id drop default`, [table]);
    }
  });
}
