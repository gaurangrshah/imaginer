/**
 * Drizzle Kit Configuration
 *
 * Used for generating and running database migrations.
 * Run: pnpm db:generate - Generate migrations
 * Run: pnpm db:migrate - Apply migrations (via push)
 */

import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH || './data/imaginer.db',
  },
} satisfies Config;
