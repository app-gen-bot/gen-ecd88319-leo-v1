import { cn, getInitials, getAvatarColor } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  status?: 'online' | 'offline' | 'away' | null;
  className?: string;
}

/**
 * Avatar component
 * Shows user profile image or initials fallback
 */
export function Avatar({
  src,
  alt,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl',
  };

  const statusSizeStyles = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
    '2xl': 'w-5 h-5 border-2',
    '3xl': 'w-6 h-6 border-2',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-text-disabled',
    away: 'bg-warning-500',
  };

  const initials = getInitials(alt);
  const bgColor = getAvatarColor(alt);

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full border-2 border-border-default overflow-hidden flex items-center justify-center font-semibold',
          sizeStyles[size]
        )}
        style={!src ? { backgroundColor: bgColor } : undefined}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white">{initials}</span>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-background-primary',
            statusSizeStyles[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
