import type { Knex } from 'knex';

// Backs POST /api/contact (doc/plan.md Phase 6). Replaces the old site's form, which only
// `setTimeout`-simulated submission client-side and never persisted anything — see
// doc/journey.md [2026-08-06.01].
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contact_submissions', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('phone').notNullable();
    table.string('email');
    table.string('company');
    table.text('message');
    table.string('locale', 5).notNullable().defaultTo('fa');
    table.string('source_page');
    // Which of the 3 catalog-defined personas the visitor came in as, if known — lets the
    // (eventual) admin inbox and doc/business_path.md's lead-routing decision route by persona.
    table.enu('persona', ['business_owner', 'programmer', 'operator', 'unknown']).defaultTo('unknown');
    table.enu('status', ['new', 'contacted', 'closed']).notNullable().defaultTo('new');
    table.string('ip_hash'); // hashed, not raw IP — lightweight spam/rate-limit signal, not PII storage
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contact_submissions');
}
