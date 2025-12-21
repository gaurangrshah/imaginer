'use server';

/**
 * Transaction Actions Module
 *
 * Server actions for Stripe payment processing and transaction records.
 * Uses Drizzle ORM with SQLite database.
 */

import { redirect } from 'next/navigation';
import Stripe from 'stripe';

import { db, transactions } from '../db';
import { handleError } from '../utils';
import { updateCredits } from './user.actions';

/**
 * Create Stripe checkout session for credit purchase
 */
export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const amount = Number(transaction.amount) * 100;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: transaction.plan,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      plan: transaction.plan,
      credits: String(transaction.credits),
      buyerId: String(transaction.buyerId), // Convert to string for Stripe metadata
    },
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
  });

  redirect(session.url!);
}

/**
 * Create transaction record after successful payment
 */
export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        stripeId: transaction.stripeId,
        amount: transaction.amount,
        plan: transaction.plan,
        credits: transaction.credits,
        buyerId: transaction.buyerId,
      })
      .returning();

    // Add credits to user account
    await updateCredits(transaction.buyerId, transaction.credits);

    return newTransaction;
  } catch (error) {
    handleError(error);
  }
}
