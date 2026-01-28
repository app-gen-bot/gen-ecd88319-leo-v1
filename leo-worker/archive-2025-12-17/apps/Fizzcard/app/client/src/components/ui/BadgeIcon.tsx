/**
 * BadgeIcon Component
 *
 * Displays badge icons with labels and colors based on badge type
 */

import { Award, Star, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

interface BadgeIconProps {
  badgeType: 'super_connector' | 'early_adopter' | 'top_earner' | 'event_host' | 'verified';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const badgeConfig = {
  super_connector: {
    icon: TrendingUp,
    label: 'Super-Connector',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Top 10% networker',
  },
  early_adopter: {
    icon: Star,
    label: 'Early Adopter',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'First 100 users',
  },
  top_earner: {
    icon: Award,
    label: 'Top Earner',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Top 5% FizzCoin earner',
  },
  event_host: {
    icon: Calendar,
    label: 'Event Host',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Created an event',
  },
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Verified account',
  },
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function BadgeIcon({
  badgeType,
  size = 'md',
  showLabel = false,
  className = '',
}: BadgeIconProps) {
  const config = badgeConfig[badgeType];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={config.description}>
      <div className={`rounded-full p-1 ${config.bgColor}`}>
        <Icon className={`${sizeClasses[size]} ${config.color}`} />
      </div>
      {showLabel && (
        <span className={`text-xs ${config.color} font-medium`}>{config.label}</span>
      )}
    </div>
  );
}

interface BadgeListProps {
  badges: Array<{ badgeType: 'super_connector' | 'early_adopter' | 'top_earner' | 'event_host' | 'verified' }>;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

/**
 * BadgeList Component
 * Displays a list of badges
 */
export function BadgeList({ badges, size = 'md', showLabels = false, className = '' }: BadgeListProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {badges.map((badge, index) => (
        <BadgeIcon
          key={`${badge.badgeType}-${index}`}
          badgeType={badge.badgeType}
          size={size}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
}

/**
 * BadgeCard Component
 * Detailed badge display with description
 */
interface BadgeCardProps {
  badgeType: 'super_connector' | 'early_adopter' | 'top_earner' | 'event_host' | 'verified';
  earnedAt: string;
  className?: string;
}

export function BadgeCard({ badgeType, earnedAt, className = '' }: BadgeCardProps) {
  const config = badgeConfig[badgeType];
  const Icon = config.icon;
  const earnedDate = new Date(earnedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${className}`}
    >
      <div className={`rounded-full p-2 ${config.bgColor}`}>
        <Icon className={`h-6 w-6 ${config.color}`} />
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {config.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Earned on {earnedDate}
        </p>
      </div>
    </div>
  );
}
