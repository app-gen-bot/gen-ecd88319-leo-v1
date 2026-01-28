import { Link } from 'wouter';
import { Sparkles, QrCode, Coins, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HomePage component
 * Landing page with hero section and CTAs
 */
export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-500 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Share Contacts, Earn Crypto</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #00D9FF 0%, #B744FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Networking,
            <br />
            Rewarded
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            FizzCard is a vibrant, mobile-first contact sharing platform with
            crypto rewards. Share your digital business card, capture meeting
            context, and earn FizzCoins.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <a>
                    <Button variant="primary" size="xl">
                      Go to Dashboard
                    </Button>
                  </a>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <a>
                      <Button variant="primary" size="xl">
                        Get Started
                      </Button>
                    </a>
                  </Link>
                  <Link href="/login">
                    <a>
                      <Button variant="secondary" size="xl">
                        Login
                      </Button>
                    </a>
                  </Link>
                </>
              )}
            </div>
            <Link href="/whitepaper">
              <a className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z"/>
                </svg>
                <span>Read the Whitepaper</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4"/>
                </svg>
              </a>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <GlassCard className="p-6">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Sharing</h3>
            <p className="text-text-secondary">
              Share contacts via QR code, NFC, or direct link. Meeting context
              auto-captured.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-12 h-12 rounded-full bg-fizzCoin-500/20 flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-fizzCoin-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Earn FizzCoins</h3>
            <p className="text-text-secondary">
              Get rewarded for every connection, introduction, and network
              activity.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Super-Connectors</h3>
            <p className="text-text-secondary">
              Discover influential networkers and climb the leaderboard.
            </p>
          </GlassCard>
        </div>

        {/* Hero Image Placeholder */}
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop"
            alt="Networking event"
            className="w-full h-64 md:h-96 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-primary to-transparent" />
        </div>
      </div>
    </AppLayout>
  );
}
