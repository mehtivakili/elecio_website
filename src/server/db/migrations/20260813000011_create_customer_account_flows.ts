import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const trx = knex;
    await trx.schema.createTable('otp_intents', (table) => {
      table.uuid('id').primary();
      table.string('phone_hash', 64).notNullable().index();
      table.string('terms_version', 40).notNullable();
      table.string('privacy_version', 40).notNullable();
      table.string('locale', 5).notNullable();
      table.timestamp('expires_at', { useTz: true }).notNullable().index();
      table.timestamp('consumed_at', { useTz: true });
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.check("locale in ('fa', 'en')");
    });

    await trx.schema.createTable('account_deletion_requests', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('auth_users').onDelete('CASCADE');
      table.string('status', 20).notNullable().defaultTo('pending');
      table.text('reason');
      table.timestamp('requested_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.timestamp('resolved_at', { useTz: true });
      table.uuid('resolved_by').references('id').inTable('auth_users').onDelete('SET NULL');
      table.check("status in ('pending', 'cancelled', 'completed', 'rejected')");
      table.index(['user_id', 'status']);
    });

    await trx.schema.alterTable('download_requests', (table) => {
      table.uuid('user_id').references('id').inTable('auth_users').onDelete('SET NULL').index();
    });
    await trx.schema.alterTable('contact_submissions', (table) => {
      table.uuid('user_id').references('id').inTable('auth_users').onDelete('SET NULL').index();
    });
}

export async function down(knex: Knex): Promise<void> {
  const trx = knex;
    await trx.schema.alterTable('contact_submissions', (table) => {
      table.dropForeign('user_id');
      table.dropColumn('user_id');
    });
    await trx.schema.alterTable('download_requests', (table) => {
      table.dropForeign('user_id');
      table.dropColumn('user_id');
    });
    await trx.schema.dropTable('account_deletion_requests');
    await trx.schema.dropTable('otp_intents');
}
