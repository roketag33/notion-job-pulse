import DatabaseConstructor from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import type { Database } from './types';

// Establish connection to local SQLite file
const dialect = new SqliteDialect({
  database: new DatabaseConstructor('scrapper-offre.db'),
});

// Export Kysely instance
export const db = new Kysely<Database>({
  dialect,
});
