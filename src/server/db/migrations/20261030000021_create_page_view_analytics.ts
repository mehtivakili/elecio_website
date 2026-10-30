import type { Knex } from 'knex';

// One row per (day, page, visitor). visitor_hash is a keyed one-way hash that includes the day,
// so it cannot be joined across days and no raw IP, user agent, cookie or account id is stored.
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('page_view_daily_visitors', (table) => {
    table.date('day').notNullable();
    table.string('locale', 2).notNullable();
    table.string('path', 255).notNullable();
    table.string('visitor_hash', 32).notNullable();
    table.integer('views').unsigned().notNullable().defaultTo(1);
    table.primary(['day', 'locale', 'path', 'visitor_hash']);
    table.index(['day', 'visitor_hash'], 'page_view_daily_visitors_day_visitor_idx');
    table.check("locale in ('fa', 'en')");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('page_view_daily_visitors');
}
