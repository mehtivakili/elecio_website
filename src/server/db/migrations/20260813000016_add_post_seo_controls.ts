import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', (table) => {
    table.string('focus_keyword_fa', 240);
    table.string('focus_keyword_en', 240);
    table.text('secondary_keywords_fa');
    table.text('secondary_keywords_en');
    table.string('canonical_url_fa', 2048);
    table.string('canonical_url_en', 2048);
    table.boolean('robots_index').notNullable().defaultTo(true);
    table.string('schema_type', 30).notNullable().defaultTo('Article');
    table.string('og_title_fa', 240);
    table.string('og_title_en', 240);
    table.string('og_description_fa', 500);
    table.string('og_description_en', 500);
  });
  await knex.raw("alter table posts add constraint posts_schema_type_check check (schema_type in ('Article', 'BlogPosting', 'TechArticle'))");
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table posts drop constraint if exists posts_schema_type_check');
  await knex.schema.alterTable('posts', (table) => {
    table.dropColumns(
      'focus_keyword_fa', 'focus_keyword_en', 'secondary_keywords_fa', 'secondary_keywords_en',
      'canonical_url_fa', 'canonical_url_en', 'robots_index', 'schema_type',
      'og_title_fa', 'og_title_en', 'og_description_fa', 'og_description_en'
    );
  });
}
