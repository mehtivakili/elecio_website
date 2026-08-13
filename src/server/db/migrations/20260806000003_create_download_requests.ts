import type { Knex } from 'knex';

// Backs POST /api/download (doc/plan.md Phase 6) — gates the catalog/spec PDFs and the
// Windows/Android installers behind a lightweight lead-capture form, per
// doc/marketing_path.md §2 (reciprocity/micro-commitment device).
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('download_requests', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('phone');
    table.string('company');
    table
      .enu('resource', [
        'catalog_pdf',
        'features_pdf',
        'windows_installer',
        'android_apk',
      ])
      .notNullable();
    table.string('locale', 5).notNullable().defaultTo('fa');
    table.string('ip_hash');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('download_requests');
}
