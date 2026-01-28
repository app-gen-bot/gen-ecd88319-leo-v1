# FizzCard Component Patterns & Implementation Guide

> Detailed implementation patterns, animations, and interactive behaviors for FizzCard components.

**Version:** 1.0.0
**Last Updated:** 2025-10-23

---

## Table of Contents

1. [Component Implementation Patterns](#component-implementation-patterns)
2. [Animation Recipes](#animation-recipes)
3. [State Management Patterns](#state-management-patterns)
4. [Interactive Behaviors](#interactive-behaviors)
5. [Performance Optimization](#performance-optimization)
6. [Code Examples](#code-examples)

---

## Component Implementation Patterns

### Glass-Morphism Card

**Implementation:**

```tsx
// GlassCard.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
}) => {
  const baseStyles = [
    'backdrop-blur-xl',
    'bg-[rgba(26,26,36,0.6)]',
    'border border-[#2A2A3A]',
    'rounded-xl',
    'transition-all duration-250 ease-out',
  ];

  const variantStyles = {
    default: '',
    elevated: 'shadow-lg',
    interactive: [
      'cursor-pointer',
      'hover:border-primary',
      'hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(0,217,255,0.2)]',
      'hover:-translate-y-1 hover:scale-[1.02]',
      'active:translate-y-0 active:scale-[0.98]',
    ].join(' '),
  };

  return (
    <div
      className={cn(...baseStyles, variantStyles[variant], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

**CSS Module Alternative:**

```css
/* GlassCard.module.css */
.glassCard {
  background: rgba(26, 26, 36, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  transition: all 250ms cubic-bezier(0, 0, 0.2, 1);
}

.glassCard.interactive {
  cursor: pointer;
}

.glassCard.interactive:hover {
  border-color: #00d9ff;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 217, 255, 0.2);
  transform: translateY(-4px) scale(1.02);
}

.glassCard.interactive:active {
  transform: translateY(0) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .glassCard {
    transition: none;
  }

  .glassCard.interactive:hover {
    transform: none;
  }
}
```

---

### FizzCoin Display Component

**Implementation:**

```tsx
// FizzCoinDisplay.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FizzCoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showParticles?: boolean;
}

export const FizzCoinDisplay: React.FC<FizzCoinDisplayProps> = ({
  amount,
  size = 'md',
  animated = false,
  showParticles = false,
}) => {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [particles, setParticles] = useState<number[]>([]);

  const sizeStyles = {
    sm: { icon: 'w-4 h-4', text: 'text-sm' },
    md: { icon: 'w-6 h-6', text: 'text-xl' },
    lg: { icon: 'w-8 h-8', text: 'text-3xl' },
    xl: { icon: 'w-12 h-12', text: 'text-5xl' },
  };

  useEffect(() => {
    if (animated && amount !== displayAmount) {
      // Count-up animation
      const increment = Math.ceil((amount - displayAmount) / 20);
      const timer = setInterval(() => {
        setDisplayAmount((prev) => {
          if (prev + increment >= amount) {
            clearInterval(timer);
            return amount;
          }
          return prev + increment;
        });
      }, 50);

      // Show particles
      if (showParticles && amount > displayAmount) {
        setParticles(Array.from({ length: 12 }, (_, i) => i));
        setTimeout(() => setParticles([]), 1000);
      }

      return () => clearInterval(timer);
    }
  }, [amount, displayAmount, animated, showParticles]);

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Coin Icon */}
      <motion.div
        className={`${sizeStyles[size].icon} rounded-full bg-gradient-to-br from-fizzCoin-500 to-fizzCoin-300`}
        animate={animated ? { rotate: 360 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-1">
          <circle cx="12" cy="12" r="10" fill="#0A0A0F" opacity="0.3" />
          <path
            d="M12 6v12M8 10h8M8 14h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-fizzCoin-900"
          />
        </svg>
      </motion.div>

      {/* Amount */}
      <motion.span
        className={`${sizeStyles[size].text} font-mono font-semibold text-fizzCoin-500`}
        style={{
          textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        }}
        animate={animated ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        {displayAmount.toLocaleString()}
      </motion.span>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-fizzCoin-500"
            style={{
              left: '50%',
              top: '50%',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((i / 12) * Math.PI * 2) * 50,
              y: Math.sin((i / 12) * Math.PI * 2) * 50 - 30,
              opacity: 0,
              scale: 0.5,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
```

**Usage:**

```tsx
// Simple display
<FizzCoinDisplay amount={1234} size="lg" />

// Animated with particles (on earning)
<FizzCoinDisplay amount={1244} size="xl" animated showParticles />
```

---

### QR Code Display with Glow

**Implementation:**

```tsx
// QRCodeDisplay.tsx
import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { motion } from 'framer-motion';

interface QRCodeDisplayProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 'md',
  animated = false,
}) => {
  const [isScanning, setIsScanning] = useState(animated);

  const sizeMap = {
    sm: 200,
    md: 280,
    lg: 320,
  };

  const qrSize = sizeMap[size];

  return (
    <motion.div
      className="relative inline-flex items-center justify-center p-8 bg-background-secondary rounded-3xl"
      style={{
        border: '4px solid #00D9FF',
        boxShadow: isScanning
          ? '0 0 60px rgba(0, 217, 255, 0.8), 0 8px 32px rgba(0, 0, 0, 0.5)'
          : '0 0 40px rgba(0, 217, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
      animate={
        isScanning
          ? {
              boxShadow: [
                '0 0 40px rgba(0, 217, 255, 0.4)',
                '0 0 60px rgba(0, 217, 255, 0.8)',
                '0 0 40px rgba(0, 217, 255, 0.4)',
              ],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* QR Code Container */}
      <div className="relative bg-white rounded-2xl p-4">
        <QRCode
          value={value}
          size={qrSize}
          level="H"
          fgColor="#00D9FF"
          bgColor="#FFFFFF"
          imageSettings={{
            src: '/logo.svg',
            height: 48,
            width: 48,
            excavate: true,
          }}
        />

        {/* Scan line animation (optional) */}
        {isScanning && (
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{
              boxShadow: '0 0 10px rgba(0, 217, 255, 0.8)',
            }}
            animate={{
              top: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </div>

      {/* Center logo glow */}
      <div
        className="absolute w-12 h-12 rounded-full bg-primary"
        style={{
          boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};
```

---

### Connection Card with Hover Effect

**Implementation:**

```tsx
// ConnectionCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

interface ConnectionCardProps {
  name: string;
  title: string;
  company?: string;
  avatarUrl?: string;
  location?: string;
  date?: string;
  badges?: string[];
  onClick?: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  name,
  title,
  company,
  avatarUrl,
  location,
  date,
  badges = [],
  onClick,
}) => {
  return (
    <motion.div
      className="p-4 backdrop-blur-xl bg-[rgba(26,26,36,0.6)] border border-[#2A2A3A] rounded-xl cursor-pointer"
      whileHover={{
        y: -4,
        scale: 1.02,
        borderColor: '#00D9FF',
        boxShadow:
          '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 217, 255, 0.2)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={avatarUrl} alt={name} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white truncate">
            {name}
          </h4>
          <p className="text-sm text-secondary truncate">{title}</p>
          {company && (
            <p className="text-xs text-tertiary truncate">{company}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {badges.map((badge) => (
            <Badge key={badge} variant="default" size="sm">
              {badge}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-tertiary">
        {location && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {location}
          </span>
        )}
        {date && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            {date}
          </span>
        )}
      </div>
    </motion.div>
  );
};
```

---

### Gradient Button with Loading State

**Implementation:**

```tsx
// Button.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'fizzCoin';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_12px_rgba(0,217,255,0.3)]',
    secondary: 'border-2 border-primary text-primary bg-transparent',
    ghost: 'text-secondary bg-transparent',
    fizzCoin:
      'bg-gradient-to-r from-fizzCoin-500 via-fizzCoin-300 to-fizzCoin-500 text-background-primary font-bold shadow-[0_0_30px_rgba(255,215,0,0.5)]',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-200 ease-out
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={
        !isDisabled
          ? {
              y: -2,
              boxShadow:
                variant === 'primary'
                  ? '0 8px 20px rgba(0, 217, 255, 0.5)'
                  : variant === 'fizzCoin'
                  ? '0 0 50px rgba(255, 215, 0, 0.8)'
                  : undefined,
            }
          : {}
      }
      whileTap={!isDisabled ? { y: 0, scale: 0.98 } : {}}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
};
```

**Usage:**

```tsx
<Button variant="primary" size="lg" onClick={handleSubmit}>
  Share FizzCard
</Button>

<Button variant="fizzCoin" loading>
  Processing...
</Button>

<Button variant="secondary" size="sm">
  Cancel
</Button>
```

---

## Animation Recipes

### 1. FizzCoin Earning Celebration

**Full implementation:**

```tsx
// FizzCoinCelebration.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FizzCoinCelebrationProps {
  amount: number;
  onComplete?: () => void;
}

export const FizzCoinCelebration: React.FC<FizzCoinCelebrationProps> = ({
  amount,
  onComplete,
}) => {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      angle: (i / 20) * Math.PI * 2,
      distance: 60 + Math.random() * 40,
      duration: 0.8 + Math.random() * 0.4,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[1090]">
      {/* Main coin burst */}
      <motion.div
        className="relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Center coin */}
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-fizzCoin-500 to-fizzCoin-300 flex items-center justify-center"
          style={{
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        >
          <span className="text-4xl font-bold text-background-primary">
            +{amount}
          </span>
        </motion.div>

        {/* Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full bg-fizzCoin-500"
            style={{
              left: '50%',
              top: '50%',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: Math.cos(particle.angle) * particle.distance,
              y: Math.sin(particle.angle) * particle.distance - 20,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>

      {/* Glow ring */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border-4 border-fizzCoin-500"
        style={{
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.6)',
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
};
```

**Usage:**

```tsx
const [showCelebration, setShowCelebration] = useState(false);

// When user earns FizzCoins
const handleConnectionAccepted = () => {
  setShowCelebration(true);
};

return (
  <>
    <AnimatePresence>
      {showCelebration && (
        <FizzCoinCelebration
          amount={10}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </AnimatePresence>
  </>
);
```

---

### 2. Success Checkmark Animation

**Implementation:**

```tsx
// SuccessCheckmark.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const SuccessCheckmark: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative w-24 h-24 rounded-full bg-success-500"
        style={{
          boxShadow: '0 0 30px rgba(0, 208, 132, 0.6)',
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.68, -0.55, 0.265, 1.55], // Spring easing
        }}
      >
        {/* Checkmark SVG */}
        <svg
          className="absolute inset-0 w-full h-full p-6"
          viewBox="0 0 24 24"
          fill="none"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
};
```

---

### 3. Skeleton Loading Animation

**Implementation:**

```tsx
// Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-[rgba(42,42,58,0.5)] via-[rgba(60,60,80,0.5)] to-[rgba(42,42,58,0.5)]
        bg-[length:200%_100%]
        animate-shimmer
        ${variantStyles[variant]}
        ${className}
      `}
    />
  );
};

// Composite skeleton components
export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-4 backdrop-blur-xl bg-[rgba(26,26,36,0.6)] border border-[#2A2A3A] rounded-xl">
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
};
```

**Tailwind config for shimmer animation:**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
};
```

---

### 4. Page Transition Animation

**Implementation:**

```tsx
// PageTransition.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
```

**Usage:**

```tsx
// In your app router
<PageTransition>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/connections" element={<ConnectionsPage />} />
    {/* ... */}
  </Routes>
</PageTransition>
```

---

## State Management Patterns

### Modal State Pattern

```tsx
// useModal.ts
import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
```

**Usage:**

```tsx
const connectionModal = useModal();

return (
  <>
    <Button onClick={connectionModal.open}>View Details</Button>

    <Modal isOpen={connectionModal.isOpen} onClose={connectionModal.close}>
      {/* Modal content */}
    </Modal>
  </>
);
```

---

### Toast Notification Pattern

```tsx
// useToast.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'fizzCoin';
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Hook for easy usage
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  return {
    success: (message: string) =>
      addToast({ message, type: 'success', duration: 3000 }),
    error: (message: string) =>
      addToast({ message, type: 'error', duration: 4000 }),
    warning: (message: string) =>
      addToast({ message, type: 'warning', duration: 3000 }),
    info: (message: string) =>
      addToast({ message, type: 'info', duration: 3000 }),
    fizzCoin: (message: string, amount: number) =>
      addToast({
        message: `${message} +${amount} FizzCoins!`,
        type: 'fizzCoin',
        duration: 4000,
      }),
  };
};
```

**Toast Component:**

```tsx
// ToastContainer.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from './useToast';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const typeStyles = {
    success: 'border-success-500',
    error: 'border-error-500',
    warning: 'border-warning-500',
    info: 'border-primary',
    fizzCoin: 'border-fizzCoin-500 shadow-[0_0_30px_rgba(255,215,0,0.5)]',
  };

  return (
    <div className="fixed top-4 right-4 z-[1080] flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`
              p-4 backdrop-blur-xl bg-[rgba(26,26,36,0.95)]
              border-2 rounded-xl shadow-lg
              ${typeStyles[toast.type]}
            `}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-start gap-3">
              {/* Icon based on type */}
              <div className="flex-shrink-0">
                {toast.type === 'success' && <SuccessIcon />}
                {toast.type === 'error' && <ErrorIcon />}
                {toast.type === 'fizzCoin' && <CoinIcon />}
              </div>

              {/* Message */}
              <p className="flex-1 text-sm text-white">{toast.message}</p>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-tertiary hover:text-white transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

**Usage:**

```tsx
const toast = useToast();

// Show success
toast.success('Connection accepted!');

// Show FizzCoin earning
toast.fizzCoin('Connection added', 10);

// Show error
toast.error('Failed to load connections');
```

---

## Interactive Behaviors

### Swipe Actions (Mobile)

**Implementation:**

```tsx
// SwipeableCard.tsx
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onMessage?: () => void;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onDelete,
  onMessage,
}) => {
  const x = useMotionValue(0);
  const [swiping, setSwiping] = useState(false);

  const background = useTransform(
    x,
    [-150, 0, 150],
    ['rgba(255, 68, 68, 0.2)', 'transparent', 'rgba(0, 217, 255, 0.2)']
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    setSwiping(false);

    if (info.offset.x < -100) {
      // Swiped left - Delete
      onDelete?.();
    } else if (info.offset.x > 100) {
      // Swiped right - Message
      onMessage?.();
    } else {
      // Snap back
      x.set(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-6"
        style={{ background }}
      >
        <span className="text-sm font-semibold text-primary">Message</span>
        <span className="text-sm font-semibold text-error-500">Delete</span>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        style={{ x }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className={swiping ? 'cursor-grabbing' : 'cursor-grab'}
      >
        {children}
      </motion.div>
    </div>
  );
};
```

**Usage:**

```tsx
<SwipeableCard
  onMessage={() => console.log('Message')}
  onDelete={() => handleDeleteConnection(id)}
>
  <ConnectionCard {...connectionData} />
</SwipeableCard>
```

---

### Pull to Refresh

**Implementation:**

```tsx
// usePullToRefresh.ts
import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
}: UsePullToRefreshOptions) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && !refreshing) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY.current;

        if (distance > 0) {
          setPulling(true);
          setPullDistance(Math.min(distance, threshold * 1.5));
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }

      setPulling(false);
      setPullDistance(0);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, threshold, refreshing, onRefresh]);

  return {
    pulling,
    refreshing,
    pullDistance,
    threshold,
  };
};
```

**Component:**

```tsx
// PullToRefreshIndicator.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  threshold: number;
  refreshing: boolean;
}

export const PullToRefreshIndicator: React.FC<
  PullToRefreshIndicatorProps
> = ({ pullDistance, threshold, refreshing }) => {
  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 flex items-center justify-center py-4 z-50"
      initial={{ y: -60 }}
      animate={{ y: pullDistance > 0 ? 0 : -60 }}
      transition={{ duration: 0.2 }}
    >
      {refreshing ? (
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      ) : (
        <motion.div
          animate={{ rotate: progress * 180 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowDown
            className="w-6 h-6 text-primary"
            style={{ opacity: progress }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};
```

---

## Performance Optimization

### Lazy Loading Images

```tsx
// LazyImage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,...', // Base64 placeholder
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;

    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.01 }
      );

      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [src]);

  return (
    <motion.img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={() => setImageLoaded(true)}
      initial={{ opacity: 0 }}
      animate={{ opacity: imageLoaded ? 1 : 0.5 }}
      transition={{ duration: 0.3 }}
    />
  );
};
```

---

### Virtual Scrolling for Long Lists

```tsx
// VirtualList.tsx
import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 80,
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Usage:**

```tsx
<VirtualList
  items={connections}
  estimateSize={100}
  renderItem={(connection) => (
    <ConnectionCard {...connection} />
  )}
/>
```

---

### Debounced Search Input

```tsx
// useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

**SearchInput component:**

```tsx
// SearchInput.tsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from './useDebounce';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Search...',
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-11 pl-4 pr-12
          backdrop-blur-lg bg-[rgba(26,26,36,0.6)]
          border border-[#2A2A3A]
          rounded-full
          text-white placeholder-tertiary
          focus:border-primary focus:outline-none
          transition-colors duration-200
        "
      />
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary pointer-events-none" />
    </div>
  );
};
```

---

## Code Examples

### Complete Modal Component

```tsx
// Modal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[rgba(10,10,15,0.9)] backdrop-blur-sm z-[1040]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[1050] pointer-events-none">
            <motion.div
              className={`
                w-full ${sizeStyles[size]} pointer-events-auto
                bg-background-secondary border border-border-default
                rounded-3xl shadow-2xl
                overflow-hidden
              `}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-border-default">
                  <h2 className="text-2xl font-semibold text-white">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-tertiary hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
```

---

### Complete Bottom Navigation

```tsx
// BottomNav.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Scan, Wallet, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'scan', label: 'Scan', icon: Scan, path: '/scan', center: true },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl bg-[rgba(26,26,36,0.9)] border-t border-border-default z-[1030]">
      <div className="flex items-center justify-around h-full px-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.center) {
            // Center scan button
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="
                  relative -top-4
                  w-14 h-14 rounded-full
                  bg-gradient-to-r from-primary to-accent
                  flex items-center justify-center
                  shadow-[0_4px_16px_rgba(0,217,255,0.5)]
                "
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 min-w-[64px]"
              whileTap={{ scale: 0.9 }}
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-primary' : 'text-tertiary'
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  isActive ? 'text-primary' : 'text-tertiary'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full"
                  layoutId="activeIndicator"
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
```

---

## Best Practices Summary

### Component Development
1. Always use design tokens from `design-tokens.ts`
2. Implement dark mode by default
3. Include loading, error, and empty states
4. Make components responsive (mobile-first)
5. Add keyboard navigation support
6. Include proper ARIA labels

### Animation Guidelines
1. Keep micro-interactions under 250ms
2. Use `ease-out` for entrances, `ease-in` for exits
3. Respect `prefers-reduced-motion`
4. Animate `transform` and `opacity` for performance
5. Add haptic feedback on mobile for important actions

### Performance
1. Lazy load images and components
2. Use virtual scrolling for long lists (100+ items)
3. Debounce search inputs
4. Implement infinite scroll instead of pagination
5. Optimize bundle size with code splitting

### Accessibility
1. Maintain WCAG AAA contrast ratios
2. Provide keyboard navigation
3. Include focus indicators
4. Add screen reader text where needed
5. Test with real assistive technologies

### Mobile Experience
1. Use 44x44px minimum touch targets
2. Implement swipe gestures where appropriate
3. Add pull-to-refresh on list screens
4. Use bottom navigation for easy reach
5. Test on actual devices, not just simulators

---

**Component Patterns maintained by FizzCard Engineering Team**

Last updated: 2025-10-23
