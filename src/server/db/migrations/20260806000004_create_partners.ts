import type { Knex } from 'knex';

// The 4 partner companies audited in doc/plan.md §4 (Pars Techno, PIM, Sanat Pazhohan Parseh,
// Techno Sanat Alizadegan) — consent confirmed by user 2026-08-06, see doc/business_path.md §6.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('partners', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('logo_path').notNullable();
    table.string('website_url');
    table.integer('sort_order').notNullable().defaultTo(0);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('partners');
}
