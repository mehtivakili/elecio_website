import type { Knex } from 'knex';

const tableName = 'publication_queue_settings';

async function replaceCadenceCheck(knex: Knex, allowedValues: string): Promise<void> {
  const [rows] = await knex.raw(
    `select constraint_name
       from information_schema.table_constraints
      where constraint_schema = database()
        and table_name = ?
        and constraint_type = 'CHECK'`,
    [tableName],
  );

  for (const row of rows as Array<{ CONSTRAINT_NAME?: string; constraint_name?: string }>) {
    const constraintName = row.CONSTRAINT_NAME ?? row.constraint_name;
    if (!constraintName) continue;
    const [details] = await knex.raw(
      `select check_clause
         from information_schema.check_constraints
        where constraint_schema = database()
          and constraint_name = ?`,
      [constraintName],
    );
    const clause = String((details as Array<{ CHECK_CLAUSE?: string; check_clause?: string }>)[0]?.CHECK_CLAUSE
      ?? (details as Array<{ CHECK_CLAUSE?: string; check_clause?: string }>)[0]?.check_clause
      ?? '');
    if (/cadence_days/i.test(clause)) {
      await knex.raw('alter table ?? drop check ??', [tableName, constraintName]);
    }
  }

  await knex.raw(
    `alter table ?? add constraint publication_queue_cadence_days_check
      check (cadence_days in (${allowedValues}))`,
    [tableName],
  );
}

export async function up(knex: Knex): Promise<void> {
  await replaceCadenceCheck(knex, '1, 2, 3, 4');
}

export async function down(knex: Knex): Promise<void> {
  await knex(tableName).where({ cadence_days: 1 }).update({ cadence_days: 2 });
  await replaceCadenceCheck(knex, '2, 3, 4');
}
