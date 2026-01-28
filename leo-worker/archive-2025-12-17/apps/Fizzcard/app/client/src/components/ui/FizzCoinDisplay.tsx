import { Coins } from 'lucide-react';
import { cn, formatFizzCoin } from '@/lib/utils';

interface FizzCoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  className?: string;
}

/**
 * FizzCoinDisplay component
 * Display FizzCoin amounts with gold styling
 */
export function FizzCoinDisplay({
  amount,
  size = 'md',
  showIcon = true,
  className,
}: FizzCoinDisplayProps) {
  const sizeStyles = {
    sm: {
      container: 'gap-1',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    md: {
      container: 'gap-2',
      icon: 'w-5 h-5',
      text: 'text-xl',
    },
    lg: {
      container: 'gap-3',
      icon: 'w-6 h-6',
      text: 'text-3xl',
    },
    xl: {
      container: 'gap-4',
      icon: 'w-8 h-8',
      text: 'text-5xl',
    },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center font-mono font-semibold text-fizzCoin-500',
        sizeStyles[size].container,
        className
      )}
      style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}
    >
      {showIcon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-br from-fizzCoin-500 to-fizzCoin-300',
            sizeStyles[size].icon
          )}
          style={{ boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}
        >
          <Coins className="w-1/2 h-1/2 text-background-primary" />
        </div>
      )}
      <span className={sizeStyles[size].text}>{formatFizzCoin(amount)}</span>
    </div>
  );
}
