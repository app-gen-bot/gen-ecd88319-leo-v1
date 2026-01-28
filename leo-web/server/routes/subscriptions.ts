/**
 * Subscription Routes - Handles subscription management via Stripe
 *
 * All routes require authentication.
 * Handles checkout sessions, billing portal, subscription status, and cancellation.
 */

import { Router, Request, Response } from 'express';
import { stripe, PRICING_TIERS, getPricingTier, isStripeConfigured } from '../lib/stripe/client';
import { db } from '../lib/db';
import { profiles, subscriptions } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Note: Request.user is already extended globally in middleware/auth.ts

/**
 * Middleware to check if Stripe is configured
 */
function requireStripe(_req: Request, res: Response, next: Function) {
  if (!isStripeConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Subscription service is not configured',
    });
  }
  next();
}

/**
 * GET /api/subscriptions
 * Get current user's subscription status
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Get user profile with subscription info
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Profile not found',
      });
    }

    // Get subscription details if exists
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    const tierConfig = getPricingTier(profile.currentTier);

    res.json({
      success: true,
      data: {
        tier: profile.currentTier,
        tierConfig,
        creditsRemaining: profile.creditsRemaining,
        creditsUsed: profile.creditsUsed,
        subscription: subscription
          ? {
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              monthlyCreditsIncluded: subscription.monthlyCreditsIncluded,
              monthlyCreditsUsed: subscription.monthlyCreditsUsed,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('[Subscriptions] Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to get subscription',
    });
  }
});

/**
 * GET /api/subscriptions/products
 * Get available pricing tiers
 */
router.get('/products', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: PRICING_TIERS,
    });
  } catch (error: any) {
    console.error('[Subscriptions] Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to get products',
    });
  }
});

/**
 * POST /api/subscriptions/checkout
 * Create a Stripe Checkout session for subscription
 */
router.post('/checkout', requireStripe, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const { priceId, billingPeriod = 'monthly' } = req.body;

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Price ID is required',
      });
    }

    // Get or create Stripe customer
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Profile not found',
      });
    }

    let stripeCustomerId = profile.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe!.customers.create({
        email: userEmail || profile.email,
        metadata: {
          userId: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to profile
      await db
        .update(profiles)
        .set({
          stripeCustomerId: customer.id,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId));
    }

    // Create checkout session
    const successUrl = `${process.env.APP_URL || 'http://localhost:5173'}/billing?success=true`;
    const cancelUrl = `${process.env.APP_URL || 'http://localhost:5173'}/pricing?canceled=true`;

    const session = await stripe!.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        billingPeriod,
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('[Subscriptions] Create checkout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to create checkout session',
    });
  }
});

/**
 * POST /api/subscriptions/portal
 * Create a Stripe Billing Portal session for subscription management
 */
router.post('/portal', requireStripe, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Get profile with Stripe customer ID
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile?.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No billing account found. Please subscribe first.',
      });
    }

    const returnUrl = `${process.env.APP_URL || 'http://localhost:5173'}/billing`;

    const session = await stripe!.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: returnUrl,
    });

    res.json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('[Subscriptions] Create portal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to create billing portal session',
    });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription at period end
 */
router.post('/cancel', requireStripe, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Get subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription?.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No active subscription found',
      });
    }

    // Cancel at period end via Stripe
    await stripe!.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local record
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
    });
  } catch (error: any) {
    console.error('[Subscriptions] Cancel error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to cancel subscription',
    });
  }
});

/**
 * POST /api/subscriptions/resume
 * Resume a canceled subscription (before period end)
 */
router.post('/resume', requireStripe, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Get subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!subscription?.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No subscription found',
      });
    }

    if (!subscription.cancelAtPeriodEnd) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Subscription is not scheduled for cancellation',
      });
    }

    // Resume via Stripe
    await stripe!.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update local record
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    res.json({
      success: true,
      message: 'Subscription resumed successfully',
    });
  } catch (error: any) {
    console.error('[Subscriptions] Resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to resume subscription',
    });
  }
});

/**
 * GET /api/subscriptions/usage
 * Get credit usage for current subscription period
 */
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Get profile and subscription
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    const tierConfig = getPricingTier(profile?.currentTier || 'free');

    res.json({
      success: true,
      data: {
        tier: profile?.currentTier || 'free',
        creditsRemaining: profile?.creditsRemaining || 0,
        creditsUsed: profile?.creditsUsed || 0,
        monthlyCreditsIncluded: subscription?.monthlyCreditsIncluded || tierConfig?.monthlyCredits || 0,
        monthlyCreditsUsed: subscription?.monthlyCreditsUsed || 0,
        periodEnd: subscription?.currentPeriodEnd || null,
        creditsResetAt: subscription?.creditsResetAt || null,
      },
    });
  } catch (error: any) {
    console.error('[Subscriptions] Get usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to get usage',
    });
  }
});

export default router;
