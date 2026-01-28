import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Calendar, Filter, Wallet, Coins, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { usePrivy } from '@privy-io/react-auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { FizzCoinDisplay } from '@/components/ui/FizzCoinDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { useCryptoWallet } from '@/hooks/useCryptoWallet';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const TRANSACTION_TYPES = {
  reward_earned: { label: 'Reward Earned', icon: '⭐', color: 'text-fizzCoin-500' },
  reward_claimed: { label: 'Reward Claimed', icon: '🎉', color: 'text-success-500' },
  exchange: { label: 'Contact Exchange', icon: '🤝', color: 'text-primary-500' },
  introduction: { label: 'Introduction', icon: '👋', color: 'text-accent-500' },
  referral: { label: 'Referral', icon: '📢', color: 'text-success-500' },
  bonus: { label: 'Bonus', icon: '🎁', color: 'text-fizzCoin-500' },
  trade: { label: 'Transfer', icon: '💱', color: 'text-info-500' },
};

/**
 * WalletPage component
 * Display FizzCoin wallet balance and transaction history
 */
export function WalletPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isCreatingPrivyWallet, setIsCreatingPrivyWallet] = useState(false);

  // FizzCard auth context (to get user's email)
  const { user: fizzCardUser } = useAuth();

  // Privy integration for wallet creation
  const { ready: privyReady, authenticated: privyAuthenticated, login: privyLogin, user: privyUser, createWallet: createPrivyWallet } = usePrivy();

  // Fetch wallet data (legacy)
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const result = await apiClient.fizzCoin.getWallet();
      if (result.status !== 200) throw new Error('Failed to fetch wallet');
      return result.body;
    },
  });

  // Fetch crypto wallet data (blockchain)
  const {
    wallet: cryptoWallet,
    balance: cryptoBalance,
    isLoadingBalance: isLoadingCryptoBalance,
    isLoadingWallet: isLoadingCryptoWallet,
    createWallet,
    isCreatingWallet,
    claimRewards,
    isClaimingRewards,
    hasPendingRewards,
  } = useCryptoWallet();

  // Auto-create wallet when Privy authentication completes
  // This ref prevents double-triggering
  const hasTriggeredWalletCreation = useRef(false);

  useEffect(() => {
    const autoCreateWallet = async () => {
      // Only proceed if:
      // 1. Privy is ready and user is authenticated
      // 2. User doesn't have a crypto wallet yet
      // 3. We haven't already triggered wallet creation
      if (
        privyReady &&
        privyAuthenticated &&
        !cryptoWallet &&
        !isLoadingCryptoWallet &&
        !hasTriggeredWalletCreation.current
      ) {
        hasTriggeredWalletCreation.current = true;

        console.log('[WalletPage] Privy authenticated, auto-creating wallet...');

        try {
          // Check if Privy already created a wallet
          const existingWallet = privyUser?.wallet;
          if (existingWallet?.address) {
            console.log('[WalletPage] Using existing Privy wallet:', existingWallet.address);
            createWallet(existingWallet.address);
            toast.success('Wallet connected successfully!');
          } else {
            // Auto-create was configured in Privy settings, so wallet should exist
            // If not, user can manually click "Connect Wallet" button
            console.log('[WalletPage] No Privy wallet found, user needs to click Connect Wallet');
            hasTriggeredWalletCreation.current = false; // Allow manual trigger
          }
        } catch (error) {
          console.error('[WalletPage] Auto wallet creation failed:', error);
          hasTriggeredWalletCreation.current = false; // Allow manual retry
        }
      }
    };

    autoCreateWallet();
  }, [privyReady, privyAuthenticated, privyUser, cryptoWallet, isLoadingCryptoWallet, createWallet]);

  const handleConnectWallet = async () => {
    if (!privyReady) {
      toast.error('Wallet service not ready. Please refresh the page.');
      return;
    }

    // If not authenticated with Privy, open the login modal
    if (!privyAuthenticated) {
      console.log('[WalletPage] User not authenticated with Privy, opening login modal...');
      console.log('[WalletPage] Using email from FizzCard account:', fizzCardUser?.email);

      toast.success('Please verify your email to create a wallet');

      // Open Privy login modal (pre-filled with user's email)
      privyLogin({
        ...(fizzCardUser?.email && { loginHint: fizzCardUser.email })
      });

      // The wallet creation will happen automatically via useEffect when authenticated
      return;
    }

    // If authenticated but no wallet yet, create one
    try {
      setIsCreatingPrivyWallet(true);

      // Check if user already has a wallet from Privy
      const existingWallet = privyUser?.wallet;
      if (existingWallet?.address) {
        console.log('[WalletPage] Using existing Privy wallet:', existingWallet.address);
        createWallet(existingWallet.address);
        return;
      }

      // Create embedded wallet with Privy
      console.log('[WalletPage] Creating new Privy embedded wallet...');
      const newWallet = await createPrivyWallet();
      console.log('[WalletPage] Privy wallet created:', newWallet);

      const walletAddress = newWallet.address;
      if (!walletAddress) {
        throw new Error('No wallet address returned from Privy');
      }

      console.log('[WalletPage] Linking wallet to backend:', walletAddress);

      // Link wallet to user account in backend
      createWallet(walletAddress);
    } catch (error: any) {
      console.error('[WalletPage] Failed to create wallet:', error);
      if (error.message && !error.message.includes('User closed modal')) {
        toast.error(error.message || 'Failed to create wallet. Please try again.');
      }
    } finally {
      setIsCreatingPrivyWallet(false);
    }
  };

  const handleCopyAddress = () => {
    if (cryptoWallet?.walletAddress) {
      navigator.clipboard.writeText(cryptoWallet.walletAddress);
      setCopiedAddress(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleClaimRewards = () => {
    if (hasPendingRewards) {
      claimRewards();
    }
  };

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', { page, type: typeFilter }],
    queryFn: async () => {
      const result = await apiClient.fizzCoin.getTransactions({
        query: {
          type: typeFilter as 'exchange' | 'introduction' | 'referral' | 'bonus' | 'trade' | undefined,
          page,
          limit: 20,
        },
      });
      if (result.status !== 200) throw new Error('Failed to fetch transactions');
      return result.body;
    },
  });

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Wallet</h1>
          <p className="text-text-secondary">
            Manage your FizzCoins and view transaction history
          </p>
        </div>

        {/* Connect Wallet Card (if no wallet) */}
        {!isLoadingCryptoWallet && !cryptoWallet && (
          <GlassCard className="p-8 mb-6 border-2 border-fizzCoin-500/30 bg-gradient-to-br from-fizzCoin-500/5 to-primary-500/5">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-fizzCoin-500/10 flex items-center justify-center">
                  <Wallet className="w-10 h-10 text-fizzCoin-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-fizzCoin-500" />
                Enable Blockchain Wallet
                <Sparkles className="w-6 h-6 text-fizzCoin-500" />
              </h2>

              <p className="text-text-secondary mb-6 text-lg">
                Connect your secure embedded wallet to start earning FizzCoins on the blockchain!
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                <div className="p-4 bg-background-glass rounded-lg border border-border-default">
                  <div className="w-10 h-10 rounded-full bg-success-500/10 flex items-center justify-center mb-3">
                    <span className="text-xl">🔐</span>
                  </div>
                  <h3 className="font-semibold mb-2">Secure & Private</h3>
                  <p className="text-sm text-text-secondary">
                    Your keys, your crypto. Non-custodial wallet secured by Privy.
                  </p>
                </div>

                <div className="p-4 bg-background-glass rounded-lg border border-border-default">
                  <div className="w-10 h-10 rounded-full bg-fizzCoin-500/10 flex items-center justify-center mb-3">
                    <span className="text-xl">⚡</span>
                  </div>
                  <h3 className="font-semibold mb-2">Instant Setup</h3>
                  <p className="text-sm text-text-secondary">
                    No seed phrases or complex setup. Get started in seconds.
                  </p>
                </div>

                <div className="p-4 bg-background-glass rounded-lg border border-border-default">
                  <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center mb-3">
                    <span className="text-xl">🎁</span>
                  </div>
                  <h3 className="font-semibold mb-2">Earn Rewards</h3>
                  <p className="text-sm text-text-secondary">
                    Claim your FizzCoins as real blockchain tokens on Base L2.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleConnectWallet}
                variant="primary"
                size="lg"
                className="px-8"
                loading={isCreatingPrivyWallet || isCreatingWallet}
                disabled={!privyReady}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isCreatingPrivyWallet ? 'Creating Wallet...' : isCreatingWallet ? 'Linking Wallet...' : 'Connect Wallet'}
              </Button>

              <p className="text-xs text-text-secondary mt-4">
                By connecting, you agree to create an embedded wallet powered by Privy
              </p>
            </div>
          </GlassCard>
        )}

        {/* Crypto Wallet Card (if exists) */}
        {cryptoWallet && (
          <GlassCard className="p-6 mb-6 border-2 border-fizzCoin-500/30">
            {isLoadingCryptoBalance ? (
              <div className="text-center">
                <Skeleton className="h-16 w-64 mx-auto mb-4" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-fizzCoin-500" />
                    <h2 className="text-lg font-semibold">Blockchain Wallet</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-fizzCoin-500/10 text-fizzCoin-500 text-xs font-semibold">
                    {cryptoWallet.walletType === 'embedded' ? 'Embedded' : 'External'}
                  </span>
                </div>

                {/* Wallet Address */}
                <div className="mb-6 p-3 bg-background-glass rounded-lg border border-border-default">
                  <p className="text-xs text-text-secondary mb-1">Wallet Address</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-mono text-text-primary">
                      {cryptoWallet.walletAddress.slice(0, 6)}...{cryptoWallet.walletAddress.slice(-4)}
                    </code>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyAddress}
                        className="p-1.5 hover:bg-background-glass rounded transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress ? (
                          <Check className="w-4 h-4 text-success-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-text-secondary" />
                        )}
                      </button>
                      <a
                        href={`https://sepolia.basescan.org/address/${cryptoWallet.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-background-glass rounded transition-colors"
                        title="View on BaseScan (Base Sepolia)"
                      >
                        <ExternalLink className="w-4 h-4 text-text-secondary" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Balance Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-background-glass rounded-lg">
                    <Coins className="w-5 h-5 text-success-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-success-500">
                      {cryptoBalance?.onChainBalance || 0}
                    </p>
                    <p className="text-xs text-text-secondary">On-Chain</p>
                  </div>
                  <div className="text-center p-3 bg-background-glass rounded-lg">
                    <TrendingUp className="w-5 h-5 text-fizzCoin-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-fizzCoin-500">
                      {cryptoBalance?.pendingClaims || 0}
                    </p>
                    <p className="text-xs text-text-secondary">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-fizzCoin-500/10 rounded-lg border border-fizzCoin-500/30">
                    <ArrowUpRight className="w-5 h-5 text-fizzCoin-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-fizzCoin-500">
                      {cryptoBalance?.totalBalance || 0}
                    </p>
                    <p className="text-xs text-text-secondary">Total</p>
                  </div>
                </div>

                {/* Claim Button */}
                {hasPendingRewards && (
                  <Button
                    onClick={handleClaimRewards}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={isClaimingRewards}
                  >
                    <Coins className="w-5 h-5 mr-2" />
                    Claim {cryptoBalance?.pendingClaims || 0} FIZZ Rewards
                  </Button>
                )}
              </>
            )}
          </GlassCard>
        )}

        {/* Legacy Balance Card */}
        <GlassCard className="p-8 mb-8">
          {walletLoading ? (
            <div className="text-center">
              <Skeleton className="h-16 w-64 mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto" />
            </div>
          ) : (
            <>
              <h2 className="text-sm text-text-secondary uppercase tracking-wider mb-4 text-center">
                {cryptoWallet ? 'Legacy Balance' : 'Current Balance'}
              </h2>
              <div className="flex justify-center mb-8">
                <FizzCoinDisplay
                  amount={wallet?.balance || 0}
                  size="xl"
                  className="justify-center"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border-default">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowDownLeft className="w-5 h-5 text-success-500" />
                    <p className="text-2xl font-bold text-success-500">
                      {wallet?.totalEarned || 0}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary">Total Earned</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUpRight className="w-5 h-5 text-error-500" />
                    <p className="text-2xl font-bold text-error-500">
                      {wallet?.totalSpent || 0}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary">Total Spent</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    <p className="text-2xl font-bold text-primary-500">
                      {wallet?.totalEarned ? ((wallet.balance / wallet.totalEarned) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary">Retention Rate</p>
                </div>
              </div>
            </>
          )}
        </GlassCard>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Transaction History</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Filter'}
            </Button>
          </div>

          {showFilters && (
            <GlassCard className="p-4 mb-4">
              <label className="block text-sm font-medium mb-2">Transaction Type</label>
              <select
                className="w-full px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={typeFilter || ''}
                onChange={(e) => {
                  setTypeFilter(e.target.value || undefined);
                  setPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="reward_earned">Reward Earned</option>
                <option value="reward_claimed">Reward Claimed</option>
                <option value="exchange">Contact Exchange</option>
                <option value="introduction">Introduction</option>
                <option value="referral">Referral</option>
                <option value="bonus">Bonus</option>
                <option value="trade">Transfer</option>
              </select>
            </GlassCard>
          )}

          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-text-secondary">
                {typeFilter ? 'No transactions match your filter' : 'No transactions yet'}
              </p>
            </GlassCard>
          ) : (
            <>
              <div className="space-y-3 mb-8">
                {transactions.map((transaction) => {
                  const type = TRANSACTION_TYPES[transaction.transactionType] || {
                    label: transaction.transactionType,
                    icon: '💰',
                    color: 'text-fizzCoin-500',
                  };
                  const isPositive = transaction.amount > 0;
                  const hasTxHash = transaction.txHash && transaction.txHash !== null;

                  return (
                    <GlassCard key={transaction.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-background-glass border border-border-default flex items-center justify-center text-xl">
                            {type.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{type.label}</p>
                            <p className="text-xs text-text-secondary flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                            {hasTxHash && (
                              <a
                                href={`https://sepolia.basescan.org/tx/${transaction.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-fizzCoin-500 hover:underline flex items-center gap-1 mt-1"
                              >
                                View on BaseScan <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-xl font-bold ${isPositive ? 'text-success-500' : 'text-error-500'}`}>
                            {isPositive ? '+' : ''}{transaction.amount}
                          </p>
                          <p className="text-xs text-text-secondary">FizzCoins</p>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-text-secondary">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
