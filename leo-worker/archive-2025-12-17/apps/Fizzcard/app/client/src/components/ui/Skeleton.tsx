import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

/**
 * Skeleton component
 * Loading placeholder with shimmer animation
 */
export function Skeleton({
  className,
  variant = 'rectangular',
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-[rgba(42,42,58,0.5)] via-[rgba(60,60,80,0.5)] to-[rgba(42,42,58,0.5)]',
        'bg-[length:200%_100%] animate-shimmer',
        variantStyles[variant],
        className
      )}
    />
  );
}

/**
 * Skeleton card for connection loading states
 */
export function SkeletonCard() {
  return (
    <div className="p-4 backdrop-blur-xl bg-background-glass border border-border-default rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton className="w-full h-20" />
    </div>
  );
}
