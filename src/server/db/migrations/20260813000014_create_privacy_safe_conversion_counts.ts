import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('conversion_daily_counts', (table) => {
    table.date('day').notNullable();
    table.string('event', 64).notNullable();
    table.string('locale', 2).notNullable();
    table.bigInteger('count').notNullable().defaultTo(0);
    table.primary(['day', 'event', 'locale']);
    table.check("event in ('contact_submitted', 'download_requested', 'order_clicked', 'account_signed_in', 'article_product_interest')");
    table.check("locale in ('fa', 'en')");
    table.check('count >= 0');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('conversion_daily_counts');
}
