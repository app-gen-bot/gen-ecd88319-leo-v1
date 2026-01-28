/**
 * FizzCard Design System Tokens
 *
 * A vibrant, dark-mode-first design system for a modern contact sharing app
 * with crypto rewards. Built for mobile-first experiences with gamification.
 *
 * @version 1.0.0
 * @theme Dark Mode Primary
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Brand Colors - Vibrant cyan/electric blue
  primary: {
    50: '#E5FAFF',
    100: '#B8F2FF',
    200: '#8AEAFF',
    300: '#5CE2FF',
    400: '#2ED9FF',
    500: '#00D9FF', // Main brand color
    600: '#00AED9',
    700: '#0083B3',
    800: '#00588C',
    900: '#002D66',
  },

  // Accent Colors - Neon purple for highlights
  accent: {
    50: '#F5E8FF',
    100: '#E5C7FF',
    200: '#D5A6FF',
    300: '#C585FF',
    400: '#B565FF',
    500: '#B744FF', // Main accent
    600: '#9337CC',
    700: '#6F2A99',
    800: '#4B1D66',
    900: '#271033',
  },

  // Background Colors - Deep dark theme
  background: {
    primary: '#0A0A0F',    // Main page background
    secondary: '#1A1A24',  // Card backgrounds
    tertiary: '#2A2A3A',   // Elevated surfaces
    overlay: 'rgba(10, 10, 15, 0.9)', // Modal overlays
    glass: 'rgba(26, 26, 36, 0.6)', // Glass-morphism
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',       // Main text
    secondary: '#A0A0B0',     // Secondary text
    tertiary: '#70707D',      // Muted text
    inverse: '#0A0A0F',       // Text on light backgrounds
    disabled: '#4A4A54',      // Disabled state
  },

  // Semantic Colors
  success: {
    50: '#E6F9EE',
    500: '#00D084',  // Success states
    600: '#00A86A',
    glow: 'rgba(0, 208, 132, 0.4)',
  },

  error: {
    50: '#FFE8E8',
    500: '#FF4444',  // Error states
    600: '#CC3636',
    glow: 'rgba(255, 68, 68, 0.4)',
  },

  warning: {
    50: '#FFF4E5',
    500: '#FF9500',  // Warning states
    600: '#CC7700',
    glow: 'rgba(255, 149, 0, 0.4)',
  },

  // FizzCoin - Gold for rewards
  fizzCoin: {
    50: '#FFFBEB',
    100: '#FFF5CC',
    200: '#FFEB99',
    300: '#FFE066',
    400: '#FFD633',
    500: '#FFD700',  // Main gold
    600: '#CCAC00',
    700: '#998100',
    800: '#665600',
    900: '#332B00',
    glow: 'rgba(255, 215, 0, 0.6)',
    particle: 'rgba(255, 215, 0, 0.8)',
  },

  // Border Colors
  border: {
    default: '#2A2A3A',       // Subtle borders
    hover: '#3A3A4A',         // Hover state
    focus: '#00D9FF',         // Focus state
    glow: 'rgba(0, 217, 255, 0.3)', // Glow effect
    glowAccent: 'rgba(183, 68, 255, 0.3)',
  },

  // Chart Colors - For data visualization
  chart: {
    blue: '#00D9FF',
    purple: '#B744FF',
    green: '#00D084',
    orange: '#FF9500',
    pink: '#FF44AA',
    cyan: '#00FFDD',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    display: ['DM Sans', 'Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'Roboto Mono', 'Courier New', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px - Small elements
  md: '0.5rem',     // 8px - Buttons, inputs
  lg: '0.75rem',    // 12px - Cards
  xl: '1rem',       // 16px - Large cards
  '2xl': '1.5rem',  // 24px - Hero elements
  '3xl': '2rem',    // 32px - QR code container
  full: '9999px',   // Circular elements
} as const;

// ============================================================================
// SHADOWS & GLOWS
// ============================================================================

export const shadows = {
  // Standard shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',

  // Glow effects - for interactive elements
  glow: {
    primary: '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.2)',
    primaryHover: '0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(0, 217, 255, 0.3)',
    accent: '0 0 20px rgba(183, 68, 255, 0.4), 0 0 40px rgba(183, 68, 255, 0.2)',
    accentHover: '0 0 30px rgba(183, 68, 255, 0.6), 0 0 60px rgba(183, 68, 255, 0.3)',
    fizzCoin: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
    fizzCoinActive: '0 0 40px rgba(255, 215, 0, 0.7), 0 0 80px rgba(255, 215, 0, 0.4)',
    success: '0 0 20px rgba(0, 208, 132, 0.4), 0 0 40px rgba(0, 208, 132, 0.2)',
    error: '0 0 20px rgba(255, 68, 68, 0.4), 0 0 40px rgba(255, 68, 68, 0.2)',
  },

  // Card shadows with subtle glow
  card: {
    default: '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(42, 42, 58, 0.5)',
    hover: '0 8px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 217, 255, 0.15)',
    active: '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 217, 255, 0.3)',
  },
} as const;

// ============================================================================
// ANIMATION TIMINGS
// ============================================================================

export const animation = {
  // Duration
  duration: {
    fast: '150ms',        // Micro-interactions
    normal: '250ms',      // Standard transitions
    slow: '400ms',        // Page transitions
    celebration: '500ms', // Reward animations
    loading: '1000ms',    // Loading states
  },

  // Easing functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy effect
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Keyframe animations (CSS-in-JS compatible)
  keyframes: {
    // Fade in
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },

    // Slide up
    slideUp: {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },

    // Slide down
    slideDown: {
      from: { transform: 'translateY(-10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },

    // Scale in
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },

    // Pulse (for notifications)
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },

    // Shimmer (for loading states)
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },

    // FizzCoin celebration
    fizzCoinCelebrate: {
      '0%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
      '50%': { transform: 'scale(1.2) rotate(5deg)', filter: 'brightness(1.5)' },
      '100%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
    },

    // Particle float (for FizzCoin particles)
    floatUp: {
      '0%': { transform: 'translateY(0) scale(1)', opacity: 1 },
      '100%': { transform: 'translateY(-50px) scale(0.5)', opacity: 0 },
    },

    // Glow pulse
    glowPulse: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)' },
      '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.8)' },
    },

    // Scan line (for QR scanner)
    scanLine: {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(100%)' },
    },

    // Bounce (for success states)
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
  },
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  loader: 1090,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '320px',    // Small mobile
  sm: '480px',    // Mobile
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px', // Extra large desktop
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // Button sizes
  button: {
    size: {
      sm: {
        height: '2rem',      // 32px
        padding: '0 0.75rem', // 12px horizontal
        fontSize: typography.fontSize.sm,
        iconSize: '1rem',     // 16px
      },
      md: {
        height: '2.5rem',    // 40px
        padding: '0 1rem',    // 16px horizontal
        fontSize: typography.fontSize.base,
        iconSize: '1.25rem',  // 20px
      },
      lg: {
        height: '3rem',      // 48px
        padding: '0 1.5rem',  // 24px horizontal
        fontSize: typography.fontSize.lg,
        iconSize: '1.5rem',   // 24px
      },
      xl: {
        height: '3.5rem',    // 56px
        padding: '0 2rem',    // 32px horizontal
        fontSize: typography.fontSize.xl,
        iconSize: '1.75rem',  // 28px
      },
    },
  },

  // Card variants
  card: {
    padding: {
      sm: spacing[4],   // 16px
      md: spacing[6],   // 24px
      lg: spacing[8],   // 32px
    },
    borderWidth: '1px',
    backdropBlur: '12px',
  },

  // Input fields
  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    padding: {
      sm: '0 0.75rem',
      md: '0 1rem',
      lg: '0 1.5rem',
    },
    borderWidth: '1px',
    focusRingWidth: '2px',
    focusRingOffset: '2px',
  },

  // Badge sizes
  badge: {
    size: {
      sm: {
        height: '1.25rem',   // 20px
        padding: '0 0.5rem',  // 8px horizontal
        fontSize: typography.fontSize.xs,
      },
      md: {
        height: '1.5rem',    // 24px
        padding: '0 0.625rem', // 10px horizontal
        fontSize: typography.fontSize.sm,
      },
      lg: {
        height: '2rem',      // 32px
        padding: '0 0.75rem', // 12px horizontal
        fontSize: typography.fontSize.base,
      },
    },
  },

  // Avatar sizes
  avatar: {
    size: {
      xs: '1.5rem',   // 24px
      sm: '2rem',     // 32px
      md: '2.5rem',   // 40px
      lg: '3rem',     // 48px
      xl: '4rem',     // 64px
      '2xl': '5rem',  // 80px
      '3xl': '6rem',  // 96px
    },
  },

  // QR Code
  qrCode: {
    size: {
      sm: '200px',
      md: '280px',
      lg: '320px',
    },
    borderWidth: '4px',
    glowIntensity: {
      default: 'rgba(0, 217, 255, 0.3)',
      active: 'rgba(0, 217, 255, 0.6)',
    },
  },

  // FizzCoin Display
  fizzCoin: {
    iconSize: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
    particleSize: '4px',
    particleCount: 12,
  },
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // Brand gradients
  primary: 'linear-gradient(135deg, #00D9FF 0%, #00AED9 100%)',
  primaryReverse: 'linear-gradient(135deg, #00AED9 0%, #00D9FF 100%)',
  accent: 'linear-gradient(135deg, #B744FF 0%, #9337CC 100%)',

  // Combined gradients
  brand: 'linear-gradient(135deg, #00D9FF 0%, #B744FF 100%)',
  brandReverse: 'linear-gradient(135deg, #B744FF 0%, #00D9FF 100%)',

  // FizzCoin gradient
  fizzCoin: 'linear-gradient(135deg, #FFD700 0%, #FFEB99 50%, #FFD700 100%)',

  // Background gradients
  backgroundRadial: 'radial-gradient(circle at top right, rgba(0, 217, 255, 0.1) 0%, transparent 50%)',
  backgroundRadialAccent: 'radial-gradient(circle at bottom left, rgba(183, 68, 255, 0.1) 0%, transparent 50%)',

  // Glass-morphism overlay
  glass: 'linear-gradient(135deg, rgba(26, 26, 36, 0.8) 0%, rgba(26, 26, 36, 0.4) 100%)',

  // Shimmer effect (for loading states)
  shimmer: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
} as const;

// ============================================================================
// BLUR VALUES
// ============================================================================

export const blur = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '40px',
} as const;

// ============================================================================
// OPACITY VALUES
// ============================================================================

export const opacity = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
} as const;

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  zIndex,
  breakpoints,
  components,
  gradients,
  blur,
  opacity,
} as const;

export default designTokens;
