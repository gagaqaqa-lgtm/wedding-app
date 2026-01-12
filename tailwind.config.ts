import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#2BB996',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        champagne: {
          50: '#fefbf3',
          100: '#fdf6e7',
          200: '#faecd0',
          300: '#f7e2b8',
          400: '#f4d8a0',
          500: '#f1ce88',
          600: '#e6b85a',
          700: '#d9a02c',
          800: '#b8841f',
          900: '#97681a',
        },
        coral: {
          50: '#fff5f3',
          100: '#ffebe6',
          200: '#ffd6cc',
          300: '#ffc2b3',
          400: '#ffad99',
          500: '#ff9980',
          600: '#ff6b4d',
          700: '#ff3d1a',
          800: '#e62e00',
          900: '#b32400',
        },
      },
      fontFamily: {
        shippori: ['var(--font-shippori)', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.95', transform: 'scale(0.98)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-20px) translateX(10px)' },
          '66%': { transform: 'translateY(10px) translateX(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.1)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        float: 'float 20s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite',
        confetti: 'confetti 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;