import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Sparkles, Zap, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Pricing Page - Displays subscription tiers with checkout integration
 *
 * Features:
 * - Monthly/Annual toggle with savings display
 * - Three tiers: Free, Pro, Enterprise
 * - Auth-aware CTAs (Guest: "Get Started", User: "Upgrade"/"Current Plan")
 * - Stripe Checkout integration for paid tiers
 */

interface PricingTier {
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

// Pricing tiers (matches server/lib/stripe/client.ts)
const PRICING_TIERS: PricingTier[] = [
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
    priceIdMonthly: null, // Will be set from env
    priceIdAnnual: null,
    isPopular: true,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    monthlyPrice: -1,
    annualPrice: -1,
    monthlyCredits: -1,
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

export default function PricingPage() {
  const { isAuthenticated, profile, session } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [tiers, setTiers] = useState<PricingTier[]>(PRICING_TIERS);

  // Fetch pricing tiers from API (to get actual price IDs)
  useEffect(() => {
    fetch('/api/subscriptions/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTiers(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const currentTier = profile?.currentTier || 'free';

  const handleSelectTier = async (tier: PricingTier) => {
    if (tier.tier === 'free') {
      // Free tier - no checkout needed
      return;
    }

    if (tier.tier === 'enterprise') {
      // Enterprise - contact sales
      window.location.href = 'mailto:sales@leo.dev?subject=Enterprise%20Inquiry';
      return;
    }

    // Pro tier - create checkout session
    if (!isAuthenticated) {
      // Redirect to login first
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    const priceId = billingPeriod === 'monthly' ? tier.priceIdMonthly : tier.priceIdAnnual;

    if (!priceId) {
      console.error('No price ID configured for', tier.tier, billingPeriod);
      return;
    }

    setLoadingTier(tier.tier);

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          priceId,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url;
      } else {
        console.error('Failed to create checkout session:', data);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoadingTier(null);
    }
  };

  const getButtonText = (tier: PricingTier) => {
    if (tier.tier === currentTier) {
      return 'Current Plan';
    }

    if (tier.tier === 'enterprise') {
      return 'Contact Sales';
    }

    if (tier.tier === 'free') {
      return isAuthenticated ? 'Downgrade' : 'Get Started';
    }

    return isAuthenticated ? 'Upgrade' : 'Get Started';
  };

  const isButtonDisabled = (tier: PricingTier) => {
    return tier.tier === currentTier;
  };

  const formatPrice = (tier: PricingTier) => {
    if (tier.monthlyPrice === -1) {
      return 'Custom';
    }

    const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
    return `$${price}`;
  };

  const getPeriodLabel = (tier: PricingTier) => {
    if (tier.monthlyPrice === -1) {
      return 'pricing';
    }
    return billingPeriod === 'monthly' ? '/month' : '/year';
  };

  const getAnnualSavings = (tier: PricingTier) => {
    if (tier.monthlyPrice <= 0) return null;
    const monthlyCost = tier.monthlyPrice * 12;
    const annualCost = tier.annualPrice;
    const savings = monthlyCost - annualCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage > 0 ? percentage : null;
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-leo-text-secondary">
              Simple, transparent pricing
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="leo-gradient-text">Choose Your Plan</span>
          </h1>

          <p className="text-xl text-leo-text-secondary max-w-2xl mx-auto mb-12">
            Start free, upgrade when you need more power. All plans include core features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-6 py-2.5 rounded-xl text-sm font-medium transition-all',
                billingPeriod === 'monthly'
                  ? 'bg-white/10 text-leo-text shadow-sm'
                  : 'text-leo-text-secondary hover:text-leo-text'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                'px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                billingPeriod === 'annual'
                  ? 'bg-white/10 text-leo-text shadow-sm'
                  : 'text-leo-text-secondary hover:text-leo-text'
              )}
            >
              Annual
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.tier}
                className={cn(
                  'relative rounded-3xl border transition-all duration-300',
                  tier.isPopular
                    ? 'bg-gradient-to-b from-purple-500/10 to-transparent border-purple-500/30 shadow-glow-sm scale-[1.02]'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                )}
              >
                {/* Popular badge */}
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold shadow-glow-sm">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Tier icon */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center mb-6',
                      tier.tier === 'free' && 'bg-cyan-500/20',
                      tier.tier === 'pro' && 'bg-purple-500/20',
                      tier.tier === 'enterprise' && 'bg-amber-500/20'
                    )}
                  >
                    {tier.tier === 'free' && <Sparkles className="h-6 w-6 text-cyan-400" />}
                    {tier.tier === 'pro' && <Zap className="h-6 w-6 text-purple-400" />}
                    {tier.tier === 'enterprise' && <Building2 className="h-6 w-6 text-amber-400" />}
                  </div>

                  {/* Tier name */}
                  <h3 className="text-2xl font-bold text-leo-text mb-2">{tier.name}</h3>
                  <p className="text-leo-text-secondary mb-6">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-leo-text">{formatPrice(tier)}</span>
                      <span className="text-leo-text-secondary">{getPeriodLabel(tier)}</span>
                    </div>
                    {billingPeriod === 'annual' && getAnnualSavings(tier) && (
                      <p className="text-sm text-emerald-400 mt-1">
                        Save {getAnnualSavings(tier)}% with annual billing
                      </p>
                    )}
                    {tier.monthlyCredits > 0 && (
                      <p className="text-sm text-leo-text-tertiary mt-2">
                        {tier.monthlyCredits} generations/month
                      </p>
                    )}
                    {tier.monthlyCredits === -1 && (
                      <p className="text-sm text-leo-text-tertiary mt-2">Unlimited generations</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectTier(tier)}
                    disabled={isButtonDisabled(tier) || loadingTier === tier.tier}
                    className={cn(
                      'w-full py-6 rounded-xl text-base font-semibold transition-all',
                      tier.isPopular
                        ? 'leo-btn-primary'
                        : tier.tier === currentTier
                          ? 'bg-white/5 text-leo-text-tertiary cursor-not-allowed'
                          : 'leo-btn-secondary'
                    )}
                  >
                    {loadingTier === tier.tier ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {getButtonText(tier)}
                        {tier.tier !== currentTier && tier.tier !== 'free' && (
                          <ArrowRight className="ml-2 h-5 w-5" />
                        )}
                      </>
                    )}
                  </Button>

                  {/* Features list */}
                  <ul className="mt-8 space-y-4">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Check
                            className={cn(
                              'h-5 w-5',
                              tier.isPopular ? 'text-purple-400' : 'text-leo-emerald'
                            )}
                          />
                        </div>
                        <span className="text-leo-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Support Section */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-leo-text mb-4">Questions?</h2>
          <p className="text-leo-text-secondary mb-6">
            Need help choosing the right plan? We're here to help.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/request-access">
              <Button variant="ghost" className="leo-btn-secondary">
                Contact Support
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/register">
                <Button className="leo-btn-primary">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
