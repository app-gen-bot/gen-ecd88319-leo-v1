import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  onClick?: () => void;
}

/**
 * GlassCard component
 * Glass-morphism card with backdrop blur
 */
export function GlassCard({
  children,
  className,
  variant = 'default',
  onClick,
}: GlassCardProps) {
  const baseStyles =
    'backdrop-blur-xl bg-background-glass border border-border-default rounded-xl transition-all duration-250 ease-out';

  const variantStyles = {
    default: '',
    elevated: 'shadow-lg',
    interactive:
      'cursor-pointer hover:border-primary hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(0,217,255,0.2)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
