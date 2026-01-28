import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, Globe, MapPin, Briefcase, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import type { SocialLink } from '@shared/schema.zod';

const SOCIAL_ICONS: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '👥',
  github: '💻',
  custom: '🔗',
};

/**
 * ViewFizzCardPage component
 * Public page to view anyone's FizzCard (works for both authenticated and non-authenticated users)
 * This is the landing page when someone scans a QR code
 */
export function ViewFizzCardPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const fizzCardId = parseInt(id || '0', 10);
  const isOwnCard = user && fizzCardId > 0; // TODO: Compare with actual user's fizzcard ID

  // Fetch FizzCard data (public endpoint - no auth required)
  const { data: fizzCard, isLoading: cardLoading, isError } = useQuery({
    queryKey: ['fizzcard', fizzCardId],
    queryFn: async () => {
      const result = await apiClient.fizzCards.getById({
        params: { id: fizzCardId },
      });
      if (result.status !== 200) {
        throw new Error('FizzCard not found');
      }
      return result.body;
    },
    enabled: fizzCardId > 0,
  });

  // Fetch social links (public endpoint)
  const { data: socialLinks = [], isLoading: socialLinksLoading } = useQuery({
    queryKey: ['social-links', fizzCardId],
    queryFn: async () => {
      const result = await apiClient.socialLinks.getByFizzCardId({
        params: { fizzCardId },
      });
      if (result.status !== 200) return [];
      return result.body;
    },
    enabled: fizzCardId > 0,
  });

  const handleConnect = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      setLocation(`/login?redirect=/fizzcard/${fizzCardId}`);
      return;
    }

    // Navigate to scanner to initiate connection
    setLocation('/scan');
  };

  const handleSaveContact = () => {
    if (!fizzCard) return;

    // Generate vCard format
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${fizzCard.displayName}
${fizzCard.title ? `TITLE:${fizzCard.title}\n` : ''}${fizzCard.company ? `ORG:${fizzCard.company}\n` : ''}${fizzCard.email ? `EMAIL:${fizzCard.email}\n` : ''}${fizzCard.phone ? `TEL:${fizzCard.phone}\n` : ''}${fizzCard.website ? `URL:${fizzCard.website}\n` : ''}${fizzCard.address ? `ADR:${fizzCard.address}\n` : ''}${fizzCard.bio ? `NOTE:${fizzCard.bio}\n` : ''}END:VCARD`;

    // Create blob and download
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fizzCard.displayName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (cardLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-12 w-12 rounded-full mb-6" />
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <Skeleton variant="circular" className="w-32 h-32 mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <Skeleton className="h-64 w-full" />
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  if (isError || !fizzCard) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <GlassCard className="p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-semibold mb-2">FizzCard Not Found</h2>
            <p className="text-text-secondary mb-6">
              This FizzCard doesn't exist or has been deleted.
            </p>
            <Button variant="primary" onClick={() => setLocation('/')}>
              Go Home
            </Button>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(isAuthenticated ? '/dashboard' : '/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </Button>

        {/* FizzCard Display */}
        <GlassCard className="p-8 relative overflow-hidden">
          {/* Theme color accent */}
          {fizzCard.themeColor && (
            <div
              className="absolute top-0 left-0 w-full h-2"
              style={{ backgroundColor: fizzCard.themeColor }}
            />
          )}

          {/* Profile Header */}
          <div className="text-center mb-8">
            <Avatar
              src={fizzCard.avatarUrl || undefined}
              alt={fizzCard.displayName}
              size="4xl"
              className="mx-auto mb-4 ring-4 ring-primary-500/30"
            />

            <h1 className="text-3xl font-bold mb-2">{fizzCard.displayName}</h1>

            {fizzCard.title && (
              <div className="flex items-center justify-center gap-2 text-text-secondary mb-1">
                <Briefcase className="w-4 h-4" />
                <p className="text-lg">{fizzCard.title}</p>
              </div>
            )}

            {fizzCard.company && (
              <p className="text-text-secondary text-lg">{fizzCard.company}</p>
            )}
          </div>

          {/* Bio */}
          {fizzCard.bio && (
            <div className="mb-8 p-4 rounded-lg bg-background-secondary/50">
              <p className="text-text-secondary text-center italic">
                "{fizzCard.bio}"
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4 mb-8">
            {fizzCard.email && (
              <a
                href={`mailto:${fizzCard.email}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50 hover:bg-background-secondary transition-colors"
              >
                <Mail className="w-5 h-5 text-primary-500" />
                <span>{fizzCard.email}</span>
              </a>
            )}

            {fizzCard.phone && (
              <a
                href={`tel:${fizzCard.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50 hover:bg-background-secondary transition-colors"
              >
                <Phone className="w-5 h-5 text-primary-500" />
                <span>{fizzCard.phone}</span>
              </a>
            )}

            {fizzCard.website && (
              <a
                href={fizzCard.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50 hover:bg-background-secondary transition-colors"
              >
                <Globe className="w-5 h-5 text-primary-500" />
                <span className="truncate">{fizzCard.website}</span>
              </a>
            )}

            {fizzCard.address && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary/50">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span>{fizzCard.address}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {!socialLinksLoading && socialLinks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Connect on Social</h3>
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((link: SocialLink) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-background-secondary/50 hover:bg-background-secondary transition-colors text-sm"
                  >
                    <span className="text-xl">{SOCIAL_ICONS[link.platform]}</span>
                    <span className="capitalize">{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isOwnCard && (
            <div className="space-y-3">
              {/* FizzCoin Reward Banner (only show if authenticated) */}
              {isAuthenticated && (
                <div className="p-4 rounded-lg bg-fizzCoin-500/10 border border-fizzCoin-500/30 mb-4">
                  <p className="text-fizzCoin-500 font-semibold text-center">
                    🪙 Connect & Earn FizzCoins!
                  </p>
                  <p className="text-sm text-text-secondary text-center mt-1">
                    +10 FizzCoins when you connect
                  </p>
                </div>
              )}

              {/* Primary CTA */}
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleConnect}
                >
                  <UserPlus className="w-5 h-5" />
                  Send Connection Request
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleConnect}
                >
                  <LogIn className="w-5 h-5" />
                  Log In to Connect
                </Button>
              )}

              {/* Save Contact (works for everyone) */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full gap-2"
                onClick={handleSaveContact}
              >
                💾 Save to Contacts
              </Button>

              {/* Download App CTA (only show for non-authenticated users) */}
              {!isAuthenticated && (
                <div className="mt-6 p-4 rounded-lg bg-primary-500/10 border border-primary-500/30 text-center">
                  <p className="text-sm text-text-secondary mb-2">
                    Don't have FizzCard yet?
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setLocation('/signup')}
                  >
                    Create Your Free FizzCard
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Own Card Message */}
          {isOwnCard && (
            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30 text-center">
              <p className="text-text-secondary">
                This is your FizzCard! Share it with others to connect.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => setLocation('/my-fizzcard')}
              >
                Edit My FizzCard
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Footer Info */}
        <div className="mt-6 text-center text-text-secondary text-sm">
          <p>Powered by FizzCard • The Smart Networking Platform</p>
        </div>
      </div>
    </AppLayout>
  );
}
