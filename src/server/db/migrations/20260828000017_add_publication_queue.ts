import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', (table) => {
    table.boolean('publication_queue_active').notNullable().defaultTo(false).index();
    table.timestamp('queued_at', { useTz: true }).index();
  });
  await knex.schema.createTable('publication_queue_settings', (table) => {
    table.tinyint('id').unsigned().primary();
    table.tinyint('cadence_days').unsigned().notNullable().defaultTo(3);
    table.timestamp('first_publish_at', { useTz: true });
    table.uuid('updated_by').references('id').inTable('auth_users').onDelete('SET NULL');
    table.timestamps(true, true);
    table.check('id = 1');
    table.check('cadence_days in (2, 3, 4)');
  });
  await knex('publication_queue_settings').insert({ id: 1, cadence_days: 3 });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('publication_queue_settings');
  await knex.schema.alterTable('posts', (table) => {
    table.dropColumns('publication_queue_active', 'queued_at');
  });
}
