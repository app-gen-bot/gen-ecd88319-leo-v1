import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./client/src/**/*.{ts,tsx}', './client/index.html'],
  theme: {
    extend: {
      fontFamily: {
        // Renaissance-inspired typography
        sans: ['Source Sans 3', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        // Warm, Renaissance-inspired shadows
        'warm-sm': '0 2px 8px hsl(30 20% 50% / 0.08)',
        'warm': '0 4px 20px hsl(30 20% 50% / 0.1), 0 1px 3px hsl(0 0% 0% / 0.05)',
        'warm-lg': '0 10px 40px hsl(30 20% 50% / 0.15), 0 2px 6px hsl(0 0% 0% / 0.08)',
        'gold': '0 4px 20px hsl(45 80% 50% / 0.2)',
        'sienna': '0 4px 14px hsl(25 85% 45% / 0.3)',
        'ultramarine': '0 4px 14px hsl(220 60% 35% / 0.3)',
      },
      colors: {
        // Renaissance color palette
        'leo-gold': 'hsl(45 80% 50%)',
        'leo-sienna': 'hsl(25 85% 45%)',
        'leo-ultramarine': 'hsl(220 60% 35%)',
        'leo-parchment': 'hsl(45 30% 97%)',
        'leo-ink': 'hsl(30 10% 15%)',
        'leo-sketch': 'hsl(30 10% 75%)',
        'leo-verdigris': 'hsl(150 40% 35%)',
        'leo-venetian': 'hsl(350 60% 45%)',

        // Legacy leo-bg colors (for compatibility with existing components)
        // Console/terminal uses dark theme
        'leo-bg': {
          DEFAULT: 'hsl(220 20% 10%)',       // Dark for console
          secondary: 'hsl(220 20% 12%)',
          tertiary: 'hsl(220 20% 16%)',
          hover: 'hsl(220 20% 20%)',
        },
        'leo-text': {
          DEFAULT: 'hsl(45 20% 95%)',
          secondary: 'hsl(45 10% 70%)',
          tertiary: 'hsl(45 10% 50%)',
        },
        'leo-border': {
          DEFAULT: 'hsl(220 15% 20%)',
          hover: 'hsl(220 15% 28%)',
        },
        'leo-primary': {
          DEFAULT: 'hsl(25 85% 45%)',
          dark: 'hsl(25 85% 35%)',
          light: 'hsl(25 85% 55%)',
        },
        'leo-accent': {
          DEFAULT: 'hsl(220 60% 45%)',
          dark: 'hsl(220 60% 35%)',
          light: 'hsl(220 60% 55%)',
        },
        'leo-emerald': {
          DEFAULT: 'hsl(150 40% 35%)',
          dark: 'hsl(150 40% 25%)',
          light: 'hsl(150 40% 45%)',
        },

        // shadcn semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in': 'slide-in 0.7s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'draw': 'draw 2s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'draw': {
          from: { 'stroke-dashoffset': '1000' },
          to: { 'stroke-dashoffset': '0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
