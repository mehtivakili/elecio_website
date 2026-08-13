import type { Knex } from 'knex';

// Video testimonials already exist on Aparat (doc/plan.md §4) — this table lets the admin
// (Phase 7/8) manage which ones are featured where, instead of hardcoding them in components.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('testimonials', (table) => {
    table.increments('id').primary();
    table.string('customer_name').notNullable();
    table.string('company_name');
    table.text('quote_fa');
    table.text('quote_en');
    table.string('video_url'); // Aparat embed URL
    table.string('avatar_path');
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('testimonials');
}
