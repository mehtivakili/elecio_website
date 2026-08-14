import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import mysql, { type RowDataPacket } from 'mysql2/promise';

type SummaryRow = RowDataPacket & {
  version: string;
  database_name: string;
  table_count: number;
  migration_count: number;
  user_count: number;
  category_count: number;
  tag_count: number;
  post_count: number;
  revision_count: number;
};

function describeTriggerFailure(error: unknown) {
  if (!(error instanceof Error)) return String(error);

  const mysqlError = error as Error & { errno?: number; sqlState?: string };
  return {
    message: mysqlError.message,
    errno: mysqlError.errno,
    sqlState: mysqlError.sqlState,
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.startsWith('mysql://')) {
    throw new Error('DATABASE_URL must be a mysql:// connection URL.');
  }

  const connection = await mysql.createConnection(databaseUrl);

  try {
    const [summaryRows] = await connection.query<SummaryRow[]>(`
      select
        version() as version,
        database() as database_name,
        (select count(*) from information_schema.tables where table_schema = database()) as table_count,
        (select count(*) from knex_migrations) as migration_count,
        (select count(*) from auth_users) as user_count,
        (select count(*) from categories) as category_count,
        (select count(*) from tags) as tag_count,
        (select count(*) from posts) as post_count,
        (select count(*) from post_revisions) as revision_count
    `);

    await connection.beginTransaction();
    const probeEmail = `mysql-probe-${randomUUID()}@example.invalid`;
    await connection.execute('insert into auth_users (name, email) values (?, ?)', ['MySQL verification probe', probeEmail]);
    const [uuidRows] = await connection.query<(RowDataPacket & { id: string })[]>(
      'select id from auth_users where email = ?',
      [probeEmail]
    );
    await connection.rollback();

    await connection.beginTransaction();
    const auditId = randomUUID();
    await connection.execute(
      `insert into audit_events (id, action, resource, outcome, request_id, metadata)
       values (?, 'mysql.verify', 'database', 'success', ?, ?)`,
      [auditId, randomUUID(), JSON.stringify({ probe: true })]
    );

    let updateFailure: unknown;
    let deleteFailure: unknown;
    try {
      await connection.execute('update audit_events set outcome = ? where id = ?', ['failure', auditId]);
    } catch (error) {
      updateFailure = error;
    }
    try {
      await connection.execute('delete from audit_events where id = ?', [auditId]);
    } catch (error) {
      deleteFailure = error;
    }
    await connection.rollback();

    const updateBlocked = (updateFailure as { sqlState?: string } | undefined)?.sqlState === '45000';
    const deleteBlocked = (deleteFailure as { sqlState?: string } | undefined)?.sqlState === '45000';
    if (!uuidRows[0]?.id || !updateBlocked || !deleteBlocked) {
      throw new Error(
        `Integrity probes failed: UUID=${Boolean(uuidRows[0]?.id)}, audit update=${updateBlocked}, audit delete=${deleteBlocked}`
      );
    }

    process.stdout.write(
      `${JSON.stringify(
        {
          ...summaryRows[0],
          uuid_default: { ok: true, sample: uuidRows[0].id },
          audit_append_only: {
            update: describeTriggerFailure(updateFailure),
            delete: describeTriggerFailure(deleteFailure),
          },
        },
        null,
        2
      )}\n`
    );
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
