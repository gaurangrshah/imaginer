/**
 * Drizzle ORM Schema Definitions
 *
 * Defines all database tables for the Imaginer application:
 * - users: User accounts synced from Clerk
 * - images: Transformed images with metadata
 * - transactions: Stripe payment records
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Users table - stores user data synced from Clerk webhooks
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  photo: text('photo').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  planId: integer('plan_id').default(1),
  creditBalance: integer('credit_balance').default(10),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Images table - stores transformed images and their metadata
 */
export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  transformationType: text('transformation_type').notNull(),
  publicId: text('public_id').notNull(),
  secureURL: text('secure_url').notNull(),
  width: integer('width'),
  height: integer('height'),
  config: text('config', { mode: 'json' }),
  transformationUrl: text('transformation_url'),
  aspectRatio: text('aspect_ratio'),
  color: text('color'),
  prompt: text('prompt'),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Transactions table - stores Stripe payment records
 */
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stripeId: text('stripe_id').notNull().unique(),
  amount: real('amount').notNull(),
  plan: text('plan'),
  credits: integer('credits'),
  buyerId: integer('buyer_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Type exports for use in actions
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
