/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E5FAFF',
          100: '#B8F2FF',
          200: '#8AEAFF',
          300: '#5CE2FF',
          400: '#2ED9FF',
          500: '#00D9FF',
          600: '#00AED9',
          700: '#0083B3',
          800: '#00588C',
          900: '#002D66',
        },
        accent: {
          50: '#F5E8FF',
          100: '#E5C7FF',
          200: '#D5A6FF',
          300: '#C585FF',
          400: '#B565FF',
          500: '#B744FF',
          600: '#9337CC',
          700: '#6F2A99',
          800: '#4B1D66',
          900: '#271033',
        },
        background: {
          primary: '#0A0A0F',
          secondary: '#1A1A24',
          tertiary: '#2A2A3A',
          overlay: 'rgba(10, 10, 15, 0.9)',
          glass: 'rgba(26, 26, 36, 0.6)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0B0',
          tertiary: '#70707D',
          disabled: '#4A4A54',
        },
        success: {
          500: '#00D084',
          600: '#00A86A',
        },
        error: {
          500: '#FF4444',
          600: '#CC3636',
        },
        warning: {
          500: '#FF9500',
          600: '#CC7700',
        },
        fizzCoin: {
          50: '#FFFBEB',
          100: '#FFF5CC',
          200: '#FFEB99',
          300: '#FFE066',
          400: '#FFD633',
          500: '#FFD700',
          600: '#CCAC00',
          700: '#998100',
          800: '#665600',
          900: '#332B00',
        },
        border: {
          default: '#2A2A3A',
          hover: '#3A3A4A',
          focus: '#00D9FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'Courier New', 'monospace'],
      },
      animation: {
        fadeIn: 'fadeIn 300ms ease-out',
        slideUp: 'slideUp 400ms ease-out',
        slideDown: 'slideDown 300ms ease-out',
        scaleIn: 'scaleIn 300ms ease-out',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        floatUp: 'floatUp 1s ease-out forwards',
        spin: 'spin 600ms linear infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          'from': { transform: 'translateY(-10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.9)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.8)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-50px) scale(0.5)', opacity: '0' },
        },
        spin: {
          'to': { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
