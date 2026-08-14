import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const trx = knex;
    await trx.schema.alterTable('auth_users', (table) => {
      table.boolean('two_factor_enabled').notNullable().defaultTo(false);
    });
    await trx.schema.createTable('auth_two_factors', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().unique().references('id').inTable('auth_users').onDelete('CASCADE');
      table.text('secret').notNullable();
      table.text('backup_codes').notNullable();
      table.boolean('verified').notNullable().defaultTo(true);
      table.integer('failed_verification_count').notNullable().defaultTo(0);
      table.timestamp('locked_until', { useTz: true });
    });
    await trx.schema.createTable('staff_invitations', (table) => {
      table.uuid('id').primary();
      table.string('email', 320).notNullable();
      table.string('name', 160).notNullable();
      table.string('role', 20).notNullable();
      table.string('token_hash', 64).notNullable().unique();
      table.uuid('invited_by').notNullable().references('id').inTable('auth_users').onDelete('RESTRICT');
      table.timestamp('expires_at', { useTz: true }).notNullable().index();
      table.timestamp('accepted_at', { useTz: true });
      table.timestamp('revoked_at', { useTz: true });
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.check("role in ('support', 'editor', 'admin')");
      table.index(['email', 'accepted_at', 'revoked_at']);
    });
    await trx.schema.alterTable('contact_submissions', (table) => {
      table.uuid('assigned_to').references('id').inTable('auth_users').onDelete('SET NULL').index();
    });
    await trx.schema.alterTable('download_requests', (table) => {
      table.uuid('assigned_to').references('id').inTable('auth_users').onDelete('SET NULL').index();
    });
}

export async function down(knex: Knex): Promise<void> {
  const trx = knex;
    await trx.schema.alterTable('download_requests', (table) => {
      table.dropForeign('assigned_to');
      table.dropColumn('assigned_to');
    });
    await trx.schema.alterTable('contact_submissions', (table) => {
      table.dropForeign('assigned_to');
      table.dropColumn('assigned_to');
    });
    await trx.schema.dropTable('staff_invitations');
    await trx.schema.dropTable('auth_two_factors');
    await trx.schema.alterTable('auth_users', (table) => table.dropColumn('two_factor_enabled'));
}
