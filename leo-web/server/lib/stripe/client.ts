/**
 * Stripe SDK Client Configuration
 *
 * Initializes the Stripe client with the secret key from environment variables.
 * Exports configured client and pricing tier configuration.
 */

import Stripe from 'stripe';

// Validate required environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured - subscription features disabled');
}

// Initialize Stripe client (lazy - will be null if key not present)
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

export interface PricingTier {
  tier: 'free' | 'pro' | 'enterprise';
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyCredits: number;
  features: string[];
  priceIdMonthly: string | null;
  priceIdAnnual: string | null;
  isPopular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Get started with basic app generation',
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyCredits: 3,
    features: [
      'Up to 3 generations per month',
      'Basic app templates',
      'Community support',
      'GitHub integration',
    ],
    priceIdMonthly: null,
    priceIdAnnual: null,
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'For professional developers and teams',
    monthlyPrice: 29,
    annualPrice: 290,
    monthlyCredits: 50,
    features: [
      'Up to 50 generations per month',
      'Priority generation queue',
      'Advanced app templates',
      'Deploy to Fly.io',
      'Email support',
      'Prompt history & search',
    ],
    priceIdMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || null,
    priceIdAnnual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || null,
    isPopular: true,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    monthlyPrice: -1, // Custom pricing
    annualPrice: -1,
    monthlyCredits: -1, // Unlimited
    features: [
      'Unlimited generations',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'SSO/SAML',
      'On-premise deployment option',
    ],
    priceIdMonthly: null,
    priceIdAnnual: null,
  },
];

/**
 * Get pricing tier configuration by tier name
 */
export function getPricingTier(tier: 'free' | 'pro' | 'enterprise'): PricingTier | undefined {
  return PRICING_TIERS.find((t) => t.tier === tier);
}

/**
 * Get monthly credits for a given tier
 */
export function getMonthlyCreditsForTier(tier: 'free' | 'pro' | 'enterprise'): number {
  const pricingTier = getPricingTier(tier);
  return pricingTier?.monthlyCredits ?? 0;
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return stripe !== null;
}

/**
 * Get Stripe webhook secret
 */
export function getWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET || null;
}
