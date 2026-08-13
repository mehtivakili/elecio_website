import { Model } from 'objection';
import { knex } from '../knex';

Model.knex(knex);

/**
 * Every domain model extends this instead of Objection's Model directly, so cross-cutting
 * conventions (timestamps, table name casing) live in one place.
 */
export class BaseModel extends Model {
  id!: number | string;
  createdAt?: string;
  updatedAt?: string;

  // Objection defaults to matching JS camelCase property names against DB column names as-is;
  // our migrations use snake_case columns (standard Postgres convention), so map between them
  // here once instead of repeating $formatDatabaseJson/$parseDatabaseJson per model.
  static get columnNameMappers() {
    return {
      parse(json: Record<string, unknown>) {
        return Object.fromEntries(
          Object.entries(json).map(([key, value]) => [snakeToCamel(key), value])
        );
      },
      format(json: Record<string, unknown>) {
        return Object.fromEntries(
          Object.entries(json).map(([key, value]) => [camelToSnake(key), value])
        );
      },
    };
  }
}

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
