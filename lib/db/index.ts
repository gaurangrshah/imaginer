/**
 * Database Connection Module
 *
 * Initializes SQLite database connection using better-sqlite3 and Drizzle ORM.
 * Creates database directory if it doesn't exist.
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import * as schema from './schema';

// Get database path from environment, default to ./data/imaginer.db
const dbPath = process.env.DATABASE_PATH || './data/imaginer.db';

// Ensure the directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Create SQLite connection
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent read/write performance
sqlite.pragma('journal_mode = WAL');

// Export Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Re-export schema types for convenience
export * from './schema';
