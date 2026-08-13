import type { Knex } from 'knex';

// The blog engine itself (doc/plan.md Phase 7). Bilingual fields are duplicated columns
// (title_fa/title_en, etc.) rather than a separate translations table — simpler for exactly two
// fixed locales (fa/en), per doc/plan.md D7; revisit only if a 3rd locale is ever added.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('posts', (table) => {
    table.increments('id').primary();
    table.string('slug').notNullable().unique();
    table
      .integer('category_id')
      .references('id')
      .inTable('categories')
      .onDelete('SET NULL');
    table
      .integer('author_id')
      .references('id')
      .inTable('admin_users')
      .onDelete('SET NULL');

    table.string('title_fa').notNullable();
    table.string('title_en').notNullable();
    table.text('excerpt_fa');
    table.text('excerpt_en');
    table.text('body_fa').notNullable(); // TipTap JSON or rendered HTML — format decided in Phase 7
    table.text('body_en').notNullable();
    table.string('cover_image_path');

    table.string('seo_title_fa');
    table.string('seo_title_en');
    table.string('seo_description_fa');
    table.string('seo_description_en');

    table.enu('status', ['draft', 'published']).notNullable().defaultTo('draft');
    table.timestamp('published_at');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('posts');
}
