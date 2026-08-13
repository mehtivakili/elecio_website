import type { Knex } from 'knex';

// Blog content pillars from doc/marketing_path.md §4.2 (education, controller how-tos, case
// studies, product updates, manufacturing efficiency) map to categories.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('slug').notNullable().unique();
    table.string('name_fa').notNullable();
    table.string('name_en').notNullable();
    table.integer('sort_order').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('categories');
}
