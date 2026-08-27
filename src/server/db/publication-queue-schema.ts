import type { Knex } from 'knex';

export async function publicationQueueSchemaReady(database: Knex | Knex.Transaction): Promise<boolean> {
  const [activeColumn, queuedAtColumn, settingsTable] = await Promise.all([
    database.schema.hasColumn('posts', 'publication_queue_active'),
    database.schema.hasColumn('posts', 'queued_at'),
    database.schema.hasTable('publication_queue_settings'),
  ]);
  return activeColumn && queuedAtColumn && settingsTable;
}
