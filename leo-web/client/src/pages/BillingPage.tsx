import { useState, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  CreditCard,
  Zap,
  ArrowRight,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Billing Page - Subscription management and credit usage
 *
 * Features:
 * - Current subscription status display
 * - Credit usage visualization
 * - Manage subscription via Stripe Billing Portal
 * - Cancel/resume subscription controls
 * - Upgrade prompts for free tier users
 */

interface SubscriptionData {
  tier: 'free' | 'pro' | 'enterprise';
  tierConfig: {
    name: string;
    monthlyCredits: number;
    features: string[];
  } | null;
  creditsRemaining: number;
  creditsUsed: number;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    monthlyCreditsIncluded: number;
    monthlyCreditsUsed: number;
  } | null;
}

export default function BillingPage() {
  const { session, profile, refreshProfile } = useAuth();
  const searchString = useSearch();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success parameter from Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get('success') === 'true') {
      setSuccessMessage('Your subscription has been updated successfully!');
      // Refresh profile to get updated tier
      refreshProfile();
      // Clear the URL parameter
      window.history.replaceState({}, '', '/billing');
    }
  }, [searchString, refreshProfile]);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.access_token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/subscriptions', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSubscriptionData(data.data);
          }
        } else {
          setError('Failed to load subscription data');
        }
      } catch (err) {
        setError('Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [session]);

  const handleManageBilling = async () => {
    if (!session?.access_token) return;

    setIsPortalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError(data.message || 'Failed to open billing portal');
      }
    } catch (err) {
      setError('Failed to open billing portal');
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session?.access_token) return;

    setIsCanceling(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Your subscription will be canceled at the end of the billing period.');
        // Refresh subscription data
        const subResponse = await fetch('/api/subscriptions', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const subData = await subResponse.json();
        if (subData.success) {
          setSubscriptionData(subData.data);
        }
      } else {
        setError(data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      setError('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!session?.access_token) return;

    setIsResuming(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Your subscription has been resumed.');
        // Refresh subscription data
        const subResponse = await fetch('/api/subscriptions', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const subData = await subResponse.json();
        if (subData.success) {
          setSubscriptionData(subData.data);
        }
      } else {
        setError(data.message || 'Failed to resume subscription');
      }
    } catch (err) {
      setError('Failed to resume subscription');
    } finally {
      setIsResuming(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'trialing':
        return 'text-cyan-400 bg-cyan-500/10';
      case 'past_due':
        return 'text-amber-400 bg-amber-500/10';
      case 'canceled':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const creditsUsed = subscriptionData?.creditsUsed || profile?.creditsUsed || 0;
  const creditsRemaining = subscriptionData?.creditsRemaining || profile?.creditsRemaining || 0;
  const totalCredits = creditsUsed + creditsRemaining;
  const usagePercentage = totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-leo-text mb-2">Billing & Subscription</h1>
          <p className="text-leo-text-secondary">
            Manage your subscription and view your usage
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-emerald-400">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-leo-text mb-1">Current Plan</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold leo-gradient-text">
                      {subscriptionData?.tierConfig?.name || profile?.currentTier || 'Free'}
                    </span>
                    {subscriptionData?.subscription?.status && (
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                          getStatusColor(subscriptionData.subscription.status)
                        )}
                      >
                        {subscriptionData.subscription.status}
                      </span>
                    )}
                    {subscriptionData?.subscription?.cancelAtPeriodEnd && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium text-amber-400 bg-amber-500/10">
                        Cancels at period end
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {subscriptionData?.tier !== 'free' && (
                    <Button
                      onClick={handleManageBilling}
                      disabled={isPortalLoading}
                      variant="ghost"
                      className="leo-btn-secondary"
                    >
                      {isPortalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Manage Billing
                          <ExternalLink className="h-3 w-3 ml-1.5" />
                        </>
                      )}
                    </Button>
                  )}
                  <Link href="/pricing">
                    <Button className="leo-btn-primary">
                      {subscriptionData?.tier === 'free' ? 'Upgrade' : 'Change Plan'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Subscription Details */}
              {subscriptionData?.subscription && (
                <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-white/[0.02]">
                  <div>
                    <p className="text-sm text-leo-text-tertiary mb-1">Current Period Ends</p>
                    <p className="text-leo-text font-medium">
                      {formatDate(subscriptionData.subscription.currentPeriodEnd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-leo-text-tertiary mb-1">Monthly Credits</p>
                    <p className="text-leo-text font-medium">
                      {subscriptionData.subscription.monthlyCreditsIncluded} generations/month
                    </p>
                  </div>
                </div>
              )}

              {/* Features List */}
              {subscriptionData?.tierConfig?.features && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-sm text-leo-text-tertiary mb-3">Plan Features</p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {subscriptionData.tierConfig.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-leo-text-secondary">
                        <Check className="h-4 w-4 text-leo-emerald flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Credit Usage Card */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-leo-text">Credit Usage</h2>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-leo-text">{creditsRemaining}</span>
                  <span className="text-leo-text-secondary">credits remaining</span>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-leo-text-secondary">{creditsUsed} used</span>
                  <span className="text-leo-text-secondary">{totalCredits} total</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      usagePercentage >= 90
                        ? 'bg-red-500'
                        : usagePercentage >= 75
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                    )}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                {usagePercentage >= 90 && (
                  <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    You're running low on credits.{' '}
                    <Link href="/pricing" className="underline hover:no-underline">
                      Upgrade for more
                    </Link>
                  </p>
                )}
              </div>

              {subscriptionData?.subscription && (
                <p className="text-sm text-leo-text-tertiary">
                  Credits reset on {formatDate(subscriptionData.subscription.currentPeriodEnd)}
                </p>
              )}
            </div>

            {/* Subscription Actions */}
            {subscriptionData?.tier !== 'free' && subscriptionData?.subscription && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-leo-text mb-4">Subscription Actions</h2>
                <div className="flex flex-wrap gap-3">
                  {subscriptionData.subscription.cancelAtPeriodEnd ? (
                    <Button
                      onClick={handleResumeSubscription}
                      disabled={isResuming}
                      className="leo-btn-primary"
                    >
                      {isResuming ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Resume Subscription
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      {isCanceling ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Cancel Subscription
                    </Button>
                  )}
                </div>
                {subscriptionData.subscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-amber-400 mt-3">
                    Your subscription is scheduled to cancel on{' '}
                    {formatDate(subscriptionData.subscription.currentPeriodEnd)}. You'll retain
                    access until then.
                  </p>
                )}
              </div>
            )}

            {/* Free Tier Upgrade CTA */}
            {subscriptionData?.tier === 'free' && (
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-leo-text mb-2">
                      Upgrade to Pro for More Power
                    </h3>
                    <p className="text-leo-text-secondary mb-4">
                      Get 50 generations per month, priority queue, and deploy to Fly.io with a
                      single click.
                    </p>
                    <Link href="/pricing">
                      <Button className="leo-btn-primary">
                        View Plans
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
