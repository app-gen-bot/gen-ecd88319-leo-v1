import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Share2, Twitter, Linkedin, Send, Mail, Link as LinkIcon } from 'lucide-react';

interface SocialShareButtonsProps {
  fizzCardId: string;
  userName: string;
  userTitle?: string;
  compact?: boolean;
}

export function SocialShareButtons({
  fizzCardId,
  userName,
  userTitle,
  compact = false,
}: SocialShareButtonsProps) {
  const shareUrl = `${window.location.origin}/card/${fizzCardId}`;
  const defaultShareText = userTitle
    ? `Check out ${userName}'s FizzCard - ${userTitle}`
    : `Check out ${userName}'s FizzCard`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!', {
        icon: '🔗',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleTwitterShare = () => {
    const text = `${defaultShareText} on @FizzCard_App 🎯`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const handleWhatsAppShare = () => {
    const text = `${defaultShareText}\n${shareUrl}`;
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsAppUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = `Check out my FizzCard - ${userName}`;
    const body = `Hi!\n\nI'd like to share my digital business card with you:\n\n${defaultShareText}\n${shareUrl}\n\nFizzCard is a modern networking platform that combines digital business cards with blockchain rewards.\n\nBest regards,\n${userName}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${userName}'s FizzCard`,
          text: defaultShareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!', { icon: '✨' });
      } catch (error) {
        // User cancelled share or error occurred
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy link if Web Share API not available
      handleCopyLink();
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleNativeShare}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Copy Link
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Share Your FizzCard</h3>
      <p className="text-sm text-muted-foreground">
        Share your digital business card with your network
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Twitter */}
        <Button
          onClick={handleTwitterShare}
          variant="secondary"
          className="gap-2 justify-start hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]"
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>

        {/* LinkedIn */}
        <Button
          onClick={handleLinkedInShare}
          variant="secondary"
          className="gap-2 justify-start hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </Button>

        {/* WhatsApp */}
        <Button
          onClick={handleWhatsAppShare}
          variant="secondary"
          className="gap-2 justify-start hover:bg-[#25D366]/10 hover:text-[#25D366]"
        >
          <Send className="h-4 w-4" />
          WhatsApp
        </Button>

        {/* Email */}
        <Button
          onClick={handleEmailShare}
          variant="secondary"
          className="gap-2 justify-start hover:bg-primary/10 hover:text-primary"
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>
      </div>

      {/* Native Share & Copy Link */}
      <div className="flex gap-3">
        {hasNativeShare && (
          <Button
            onClick={handleNativeShare}
            variant="primary"
            className="flex-1 gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share...
          </Button>
        )}
        <Button
          onClick={handleCopyLink}
          variant="secondary"
          className={hasNativeShare ? 'flex-1 gap-2' : 'w-full gap-2'}
        >
          <LinkIcon className="h-4 w-4" />
          Copy Link
        </Button>
      </div>

      {/* Share URL Preview */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground mb-1">Your share link:</p>
        <code className="text-xs text-foreground break-all">{shareUrl}</code>
      </div>
    </div>
  );
}
