/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 * CRITICAL: This route MUST use raw body parser for signature verification.
 *
 * Events handled:
 * - checkout.session.completed: Create subscription, grant initial credits
 * - customer.subscription.created: Record subscription
 * - customer.subscription.updated: Sync status, handle tier changes
 * - customer.subscription.deleted: Cancel subscription, reset to free
 * - invoice.paid: Reset monthly credits
 * - invoice.payment_failed: Mark as past_due
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, getWebhookSecret, getMonthlyCreditsForTier } from '../lib/stripe/client';
import { db } from '../lib/db';
import { profiles, subscriptions, subscriptionEvents, creditTransactions } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Type guards
type SubscriptionTier = 'free' | 'pro' | 'enterprise';

function isValidTier(tier: string): tier is SubscriptionTier {
  return ['free', 'pro', 'enterprise'].includes(tier);
}

/**
 * Check if event has already been processed (idempotency)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: subscriptionEvents.id })
    .from(subscriptionEvents)
    .where(eq(subscriptionEvents.stripeEventId, eventId))
    .limit(1);
  return !!existing;
}

/**
 * Record event for idempotency
 */
async function recordEvent(
  event: Stripe.Event,
  userId: string | null
): Promise<void> {
  await db.insert(subscriptionEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    stripeCustomerId: (event.data.object as any).customer || null,
    stripeSubscriptionId: (event.data.object as any).id || (event.data.object as any).subscription || null,
    userId,
    payload: event.data.object as any,
  });
}

/**
 * Get user ID from Stripe customer ID
 */
async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.stripeCustomerId, customerId))
    .limit(1);
  return profile?.id || null;
}

/**
 * Handle checkout.session.completed
 * Creates subscription record and grants initial credits
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.userId;

  if (!userId || !subscriptionId) {
    console.error('[Webhook] Missing userId or subscriptionId in checkout session');
    return;
  }

  // Get subscription details from Stripe
  const stripeSubscription = await stripe!.subscriptions.retrieve(subscriptionId);
  // Access subscription data - use type assertion for API compatibility
  const subData = stripeSubscription as any;

  // Determine tier from price metadata or ID
  let tier: SubscriptionTier = 'pro'; // Default to pro for paid subscriptions
  const priceMetadata = subData.items?.data?.[0]?.price?.metadata;
  if (priceMetadata?.tier && isValidTier(priceMetadata.tier)) {
    tier = priceMetadata.tier;
  }

  const monthlyCredits = getMonthlyCreditsForTier(tier);

  // Get period timestamps
  const periodStart = new Date(subData.current_period_start * 1000);
  const periodEnd = new Date(subData.current_period_end * 1000);

  // Create or update subscription record
  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existingSub.length > 0) {
    // Update existing subscription
    await db
      .update(subscriptions)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        tier,
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subData.cancel_at_period_end,
        monthlyCreditsIncluded: monthlyCredits,
        monthlyCreditsUsed: 0,
        creditsResetAt: periodStart,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  } else {
    // Create new subscription
    await db.insert(subscriptions).values({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      tier,
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subData.cancel_at_period_end,
      monthlyCreditsIncluded: monthlyCredits,
      monthlyCreditsUsed: 0,
      creditsResetAt: periodStart,
    });
  }

  // Update profile with tier and grant credits
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (profile) {
    const newCredits = profile.creditsRemaining + monthlyCredits;

    await db
      .update(profiles)
      .set({
        stripeCustomerId: customerId,
        currentTier: tier,
        creditsRemaining: newCredits,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    // Log credit transaction
    await db.insert(creditTransactions).values({
      userId,
      type: 'subscription_grant',
      amount: monthlyCredits,
      balanceBefore: profile.creditsRemaining,
      balanceAfter: newCredits,
      description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription started - ${monthlyCredits} monthly credits granted`,
    });
  }

  console.log(`[Webhook] Subscription created for user ${userId}, tier: ${tier}, credits: ${monthlyCredits}`);
}

/**
 * Handle customer.subscription.updated
 * Syncs status and handles tier changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const subData = subscription as any;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;

  const userId = await getUserIdFromCustomer(customerId);
  if (!userId) {
    console.error('[Webhook] No user found for customer:', customerId);
    return;
  }

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    trialing: 'trialing',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    paused: 'paused',
  };

  const status = statusMap[subscription.status] || 'active';

  await db
    .update(subscriptions)
    .set({
      status: status as any,
      currentPeriodStart: new Date(subData.current_period_start * 1000),
      currentPeriodEnd: new Date(subData.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subData.canceled_at ? new Date(subData.canceled_at * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Webhook] Subscription ${subscriptionId} updated, status: ${status}`);
}

/**
 * Handle customer.subscription.deleted
 * Resets user to free tier
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;

  const userId = await getUserIdFromCustomer(customerId);
  if (!userId) {
    console.error('[Webhook] No user found for customer:', customerId);
    return;
  }

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  // Reset profile to free tier
  await db
    .update(profiles)
    .set({
      currentTier: 'free',
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId));

  console.log(`[Webhook] Subscription ${subscriptionId} deleted, user ${userId} reset to free tier`);
}

/**
 * Handle invoice.paid
 * Resets monthly credits on successful payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const invoiceData = invoice as any;
  const customerId = invoice.customer as string;
  const subscriptionId = invoiceData.subscription as string;

  if (!subscriptionId) return; // Not a subscription invoice

  const userId = await getUserIdFromCustomer(customerId);
  if (!userId) {
    console.error('[Webhook] No user found for customer:', customerId);
    return;
  }

  // Get subscription to determine tier
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (!sub) return;

  const monthlyCredits = getMonthlyCreditsForTier(sub.tier);

  // Reset monthly credits used
  await db
    .update(subscriptions)
    .set({
      monthlyCreditsUsed: 0,
      creditsResetAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  // Grant credits to profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (profile) {
    const newCredits = profile.creditsRemaining + monthlyCredits;

    await db
      .update(profiles)
      .set({
        creditsRemaining: newCredits,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    // Log credit transaction
    await db.insert(creditTransactions).values({
      userId,
      type: 'subscription_reset',
      amount: monthlyCredits,
      balanceBefore: profile.creditsRemaining,
      balanceAfter: newCredits,
      description: `Monthly credits reset - ${monthlyCredits} credits granted`,
    });
  }

  console.log(`[Webhook] Invoice paid, credits reset for user ${userId}`);
}

/**
 * Handle invoice.payment_failed
 * Marks subscription as past_due
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const invoiceData = invoice as any;
  const subscriptionId = invoiceData.subscription as string;
  if (!subscriptionId) return;

  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`);
}

/**
 * POST /api/webhooks/stripe
 * Main webhook endpoint
 *
 * IMPORTANT: This endpoint expects raw body for signature verification.
 * Configure express.raw() middleware for this route in index.ts
 */
router.post('/', async (req: Request, res: Response) => {
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret || !stripe) {
    console.error('[Webhook] Stripe not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Check idempotency
  if (await isEventProcessed(event.id)) {
    console.log(`[Webhook] Event ${event.id} already processed, skipping`);
    return res.status(200).json({ received: true, skipped: true });
  }

  // Return 200 immediately to acknowledge receipt
  res.status(200).json({ received: true });

  // Process event asynchronously
  try {
    let userId: string | null = null;

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        userId = session.metadata?.userId || null;
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        userId = await getUserIdFromCustomer(subscription.customer as string);
        await handleSubscriptionUpdated(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        userId = await getUserIdFromCustomer(deletedSub.customer as string);
        await handleSubscriptionDeleted(deletedSub);
        break;

      case 'invoice.paid':
        const paidInvoice = event.data.object as Stripe.Invoice;
        userId = await getUserIdFromCustomer(paidInvoice.customer as string);
        await handleInvoicePaid(paidInvoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        userId = await getUserIdFromCustomer(failedInvoice.customer as string);
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Record event for idempotency
    await recordEvent(event, userId);

  } catch (error: any) {
    console.error(`[Webhook] Error processing ${event.type}:`, error);
    // Don't throw - we already acknowledged receipt
  }
});

export default router;
