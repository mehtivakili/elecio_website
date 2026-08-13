import type { Knex } from 'knex';

// Internal-only accounts for the Refine admin (doc/plan.md Phase 7/8) — a small, fixed set of
// real people (the existing 3-person team), not public user registration.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('admin_users', (table) => {
    table.increments('id').primary();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    table.enu('role', ['admin', 'editor']).notNullable().defaultTo('editor');
    table.timestamp('last_login_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('admin_users');
}
