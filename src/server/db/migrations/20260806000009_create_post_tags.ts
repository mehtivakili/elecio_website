import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('post_tags', (table) => {
    table.integer('post_id').unsigned().notNullable().references('id').inTable('posts').onDelete('CASCADE');
    table.integer('tag_id').unsigned().notNullable().references('id').inTable('tags').onDelete('CASCADE');
    table.primary(['post_id', 'tag_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('post_tags');
}
