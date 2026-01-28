import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'super_connector' | 'verified' | 'top_earner' | 'location';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Badge component
 * Display labels, tags, and status badges
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const sizeStyles = {
    sm: 'h-5 px-2 text-xs',
    md: 'h-6 px-2.5 text-sm',
    lg: 'h-8 px-3 text-base',
  };

  const variantStyles = {
    default:
      'bg-white/5 border border-border-default text-text-secondary',
    super_connector:
      'bg-accent-500/20 border border-accent-500 text-accent-500 shadow-[0_0_12px_rgba(183,68,255,0.3)]',
    verified:
      'bg-primary-500/20 border border-primary-500 text-primary-500',
    top_earner:
      'bg-fizzCoin-500/20 border border-fizzCoin-500 text-fizzCoin-500 shadow-[0_0_12px_rgba(255,215,0,0.3)]',
    location:
      'bg-white/5 border border-border-default text-text-tertiary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider whitespace-nowrap',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
