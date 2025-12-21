'use server';

/**
 * User Actions Module
 *
 * Server actions for user management, synced with Clerk authentication.
 * Uses Drizzle ORM with SQLite database.
 */

import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db, users } from '../db';
import { handleError } from '../utils';

/**
 * Create a new user in the database
 * Called by Clerk webhook on user.created event
 */
export async function createUser(user: CreateUserParams) {
  try {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        photo: user.photo,
        firstName: user.firstName,
        lastName: user.lastName,
      })
      .returning();

    return newUser;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get user by Clerk ID
 * Used to look up users from Clerk authentication
 */
export async function getUserById(clerkId: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));

    if (!user) throw new Error('User not found');

    return user;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Update user profile data
 * Called by Clerk webhook on user.updated event
 */
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photo: user.photo,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkId))
      .returning();

    if (!updatedUser) throw new Error('User update failed');

    return updatedUser;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Delete user from database
 * Called by Clerk webhook on user.deleted event
 * Note: Images are cascade-deleted due to foreign key constraint
 */
export async function deleteUser(clerkId: string) {
  try {
    const [userToDelete] = await db.select().from(users).where(eq(users.clerkId, clerkId));

    if (!userToDelete) {
      throw new Error('User not found');
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userToDelete.id))
      .returning();

    revalidatePath('/');

    return deletedUser || null;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Update user credit balance
 * @param userId - Database user ID (integer)
 * @param creditFee - Amount to add (positive) or deduct (negative)
 */
export async function updateCredits(userId: number, creditFee: number) {
  try {
    // For credit deductions (negative creditFee), validate sufficient balance
    if (creditFee < 0) {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error('User not found');

      if ((user.creditBalance || 0) < Math.abs(creditFee)) {
        throw new Error('Insufficient credits');
      }
    }

    const [updatedUserCredits] = await db
      .update(users)
      .set({
        creditBalance: sql`${users.creditBalance} + ${creditFee}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUserCredits) throw new Error('User credits update failed');

    return updatedUserCredits;
  } catch (error) {
    handleError(error);
  }
}
