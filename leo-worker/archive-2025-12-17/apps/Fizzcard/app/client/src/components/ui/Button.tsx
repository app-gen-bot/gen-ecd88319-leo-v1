import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'fizzCoin';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  className?: string;
}

/**
 * Button component with multiple variants and sizes
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-[0_4px_12px_rgba(0,217,255,0.3)] hover:shadow-[0_8px_20px_rgba(0,217,255,0.5)]',
    secondary:
      'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500/10 hover:shadow-[0_0_20px_rgba(0,217,255,0.3)]',
    ghost:
      'text-text-secondary bg-transparent hover:text-text-primary hover:bg-white/5',
    fizzCoin:
      'bg-gradient-to-r from-fizzCoin-500 via-fizzCoin-300 to-fizzCoin-500 text-background-primary font-bold shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:shadow-[0_0_50px_rgba(255,215,0,0.8)] hover:scale-105',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && 'hover:translate-y-0 hover:scale-100',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
