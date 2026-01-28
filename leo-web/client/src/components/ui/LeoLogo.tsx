/**
 * Leo Logo Component
 * Inspired by Leonardo da Vinci's geometric studies and the golden ratio
 * Features a stylized "L" formed by intersecting golden spirals/circles
 */

interface LeoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function LeoLogo({ className = '', size = 'md', showText = true }: LeoLogoProps) {
  const sizes = {
    sm: { mark: 32, text: 'text-xl' },
    md: { mark: 40, text: 'text-2xl md:text-3xl' },
    lg: { mark: 56, text: 'text-3xl md:text-4xl' },
  };

  const { mark, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Mark - Geometric "L" inspired by da Vinci's golden ratio studies */}
      <div
        className="relative flex-shrink-0"
        style={{ width: mark, height: mark }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle - represents perfection and unity */}
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="url(#leo-gradient-bg)"
            className="drop-shadow-md"
          />

          {/* Outer ring - golden ratio proportion */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#leo-gradient-ring)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />

          {/* Inner geometric pattern - da Vinci style construction lines */}
          <path
            d="M16 12 L16 36 L32 36"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Accent dot - golden ratio point */}
          <circle cx="32" cy="36" r="3" fill="white" opacity="0.9" />

          {/* Small construction circle - engineering precision */}
          <circle
            cx="16"
            cy="12"
            r="4"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient
              id="leo-gradient-bg"
              x1="0"
              y1="0"
              x2="48"
              y2="48"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="hsl(25 85% 45%)" />
              <stop offset="100%" stopColor="hsl(35 80% 50%)" />
            </linearGradient>
            <linearGradient
              id="leo-gradient-ring"
              x1="0"
              y1="0"
              x2="48"
              y2="48"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Logo Text - Elegant serif typography */}
      {showText && (
        <span
          className={`font-serif font-bold tracking-tight ${text}`}
          style={{ color: 'hsl(30 10% 15%)' }}
        >
          Leo
        </span>
      )}
    </div>
  );
}

/**
 * Compact logo variant for tight spaces
 */
export function LeoLogoMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="url(#leo-mark-gradient)"
          className="drop-shadow-md"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M16 12 L16 36 L32 36"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="32" cy="36" r="3" fill="white" opacity="0.9" />
        <circle
          cx="16"
          cy="12"
          r="4"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <defs>
          <linearGradient
            id="leo-mark-gradient"
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="hsl(25 85% 45%)" />
            <stop offset="100%" stopColor="hsl(35 80% 50%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default LeoLogo;
