/**
 * ProfileCompletionIndicator Component
 *
 * Shows a progress indicator and checklist for completing user profile
 * Helps users understand what information is missing and encourages completion
 */

import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { FizzCard, SocialLink, CryptoWallet } from '@shared/schema.zod';

export interface ProfileCompletionData {
  fizzCard: FizzCard | null;
  socialLinks: SocialLink[];
  cryptoWallet: CryptoWallet | null;
  hasAvatar: boolean;
}

export interface ProfileCompletionIndicatorProps {
  data: ProfileCompletionData;
  onActionClick?: (action: string) => void;
  compact?: boolean;
}

interface CompletionItem {
  id: string;
  label: string;
  isComplete: boolean;
  action: string;
  actionLabel: string;
  points: number;
}

/**
 * Calculate profile completion percentage and checklist items
 */
function calculateCompletion(data: ProfileCompletionData): {
  percentage: number;
  items: CompletionItem[];
  totalPoints: number;
  earnedPoints: number;
} {
  const items: CompletionItem[] = [
    {
      id: 'basic-info',
      label: 'Add display name and title',
      isComplete: !!(data.fizzCard?.displayName && data.fizzCard?.title),
      action: 'edit-fizzcard',
      actionLabel: 'Edit Profile',
      points: 10,
    },
    {
      id: 'contact',
      label: 'Add email and phone number',
      isComplete: !!(data.fizzCard?.email && data.fizzCard?.phone),
      action: 'edit-fizzcard',
      actionLabel: 'Add Contact',
      points: 10,
    },
    {
      id: 'company',
      label: 'Add company information',
      isComplete: !!(data.fizzCard?.company),
      action: 'edit-fizzcard',
      actionLabel: 'Add Company',
      points: 5,
    },
    {
      id: 'bio',
      label: 'Write a bio (50+ characters)',
      isComplete: !!(data.fizzCard?.bio && data.fizzCard.bio.length >= 50),
      action: 'edit-fizzcard',
      actionLabel: 'Write Bio',
      points: 10,
    },
    {
      id: 'avatar',
      label: 'Upload profile photo',
      isComplete: data.hasAvatar,
      action: 'upload-avatar',
      actionLabel: 'Upload Photo',
      points: 15,
    },
    {
      id: 'social-links',
      label: 'Add at least 2 social media links',
      isComplete: data.socialLinks.length >= 2,
      action: 'add-social-links',
      actionLabel: 'Add Links',
      points: 10,
    },
    {
      id: 'crypto-wallet',
      label: 'Connect blockchain wallet',
      isComplete: !!data.cryptoWallet,
      action: 'connect-wallet',
      actionLabel: 'Connect Wallet',
      points: 20,
    },
    {
      id: 'website',
      label: 'Add website or portfolio link',
      isComplete: !!(data.fizzCard?.website),
      action: 'edit-fizzcard',
      actionLabel: 'Add Website',
      points: 5,
    },
  ];

  const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = items.reduce((sum, item) => sum + (item.isComplete ? item.points : 0), 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  return { percentage, items, totalPoints, earnedPoints };
}

/**
 * Get color class based on completion percentage
 */
function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'bg-success-500';
  if (percentage >= 50) return 'bg-fizzCoin-500';
  if (percentage >= 25) return 'bg-primary-500';
  return 'bg-text-tertiary';
}

/**
 * Get motivational message based on completion percentage
 */
function getMotivationalMessage(percentage: number): string {
  if (percentage === 100) return "🎉 Your profile is complete! You're ready to make connections.";
  if (percentage >= 80) return "🌟 Almost there! Just a few more details to go.";
  if (percentage >= 50) return "💪 Great progress! Keep building your profile.";
  if (percentage >= 25) return "🚀 Good start! Complete your profile to stand out.";
  return "📝 Let's build your professional presence!";
}

export function ProfileCompletionIndicator({
  data,
  onActionClick,
  compact = false,
}: ProfileCompletionIndicatorProps) {
  const { percentage, items, totalPoints, earnedPoints } = calculateCompletion(data);
  const progressColor = getProgressColor(percentage);
  const motivationalMessage = getMotivationalMessage(percentage);
  const incompleteItems = items.filter(item => !item.isComplete);

  // Don't show if profile is 100% complete
  if (percentage === 100 && compact) {
    return null;
  }

  if (compact) {
    return (
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary-500/10 to-fizzCoin-500/10 border border-primary-500/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold">Profile Completion</span>
            </div>
            <p className="text-xs text-text-secondary">{motivationalMessage}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-500">{percentage}%</div>
            <div className="text-xs text-text-tertiary">{earnedPoints}/{totalPoints} points</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Next action hint */}
        {incompleteItems.length > 0 && (
          <div className="mt-3 text-xs text-text-secondary">
            Next: {incompleteItems[0].label}
          </div>
        )}
      </div>
    );
  }

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Profile Completion
          </h3>
          <p className="text-sm text-text-secondary mt-1">{motivationalMessage}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-500">{percentage}%</div>
          <div className="text-xs text-text-tertiary">{earnedPoints}/{totalPoints} points</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-background-secondary rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Completion checklist */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              item.isComplete
                ? 'bg-success-500/10 border border-success-500/20'
                : 'bg-background-secondary border border-border-default hover:border-primary-500/30'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {item.isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-text-tertiary flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-medium ${item.isComplete ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {item.label}
                </div>
                <div className="text-xs text-text-tertiary">+{item.points} points</div>
              </div>
            </div>

            {!item.isComplete && onActionClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onActionClick(item.action)}
                className="flex-shrink-0"
              >
                {item.actionLabel}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Completion reward message */}
      {percentage === 100 && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-success-500/10 to-fizzCoin-500/10 border border-success-500/30">
          <div className="flex items-center gap-2 text-success-500 font-semibold mb-1">
            <CheckCircle2 className="w-5 h-5" />
            Profile Complete!
          </div>
          <p className="text-sm text-text-secondary">
            Your profile is 100% complete. You're ready to make meaningful connections and earn FizzCoins!
          </p>
        </div>
      )}

      {/* Motivation for incomplete profiles */}
      {percentage < 100 && (
        <div className="mt-6 p-4 rounded-lg bg-primary-500/5 border border-primary-500/20">
          <p className="text-sm text-text-secondary">
            💡 <span className="font-semibold text-text-primary">Pro tip:</span> Profiles with more information get
            {' '}<span className="text-fizzCoin-500 font-semibold">2x more connections</span> on average!
          </p>
        </div>
      )}
    </GlassCard>
  );
}
