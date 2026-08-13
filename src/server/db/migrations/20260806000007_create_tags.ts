import type { Knex } from 'knex';

// Controller names (Fanuc, Heidenhain, Siemens, ...) are the primary intended use of tags —
// doc/marketing_path.md §4.1's long-tail SEO bet depends on per-controller tagging.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.string('slug').notNullable().unique();
    table.string('name_fa').notNullable();
    table.string('name_en').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tags');
}
