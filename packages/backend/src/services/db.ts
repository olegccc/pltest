import Database from 'better-sqlite3';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

interface EventRecord {
  event_id: string;
  user_id: string;
  event_type: string;
  timestamp: string;
  value: string;
}

export const createDb = () => {
  const db = new Database(':memory:');

  db.exec(`
    CREATE TABLE events (
      event_id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT,
      timestamp TEXT,
      value REAL
    )
  `);

  if (!process.env.CSV_PATH) {
    throw new Error('CSV_PATH environment variable is required');
  }

  const csvPath = process.env.CSV_PATH;
  const csvContent = readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as EventRecord[];

  const insert = db.prepare(`
    INSERT INTO events (event_id, user_id, event_type, timestamp, value)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const event of records) {
    insert.run(
      event.event_id,
      event.user_id,
      event.event_type,
      event.timestamp,
      event.value || null
    );
  }

  const query = <T = unknown>(sql: string, params?: unknown[]) => {
    const stmt = db.prepare(sql);
    return (params ? stmt.all(...params) : stmt.all()) as T[];
  };

  return {
    query,
  };
};

export type DbService = ReturnType<typeof createDb>;
