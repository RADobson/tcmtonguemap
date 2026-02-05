import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TCM Brand Colors
        'tcm-green': {
          DEFAULT: '#2d5a27',
          50: '#f0f7ef',
          100: '#d9ebd6',
          200: '#b3d7ad',
          300: '#8dc384',
          400: '#67af5b',
          500: '#4a8c40',
          600: '#3d7a35',
          700: '#2d5a27',
          800: '#1a3d16',
          900: '#0f240d',
        },
        'tcm-brown': {
          DEFAULT: '#8b4513',
          50: '#fdf6f0',
          100: '#f5e6d3',
          200: '#e8cca7',
          300: '#d4a574',
          400: '#c17a45',
          500: '#a65d2e',
          600: '#8b4513',
          700: '#6b3410',
          800: '#4a240b',
          900: '#2d1607',
        },
        'tcm-gold': {
          DEFAULT: '#c9a227',
          50: '#fdf9e8',
          100: '#f9edc2',
          200: '#f2db85',
          300: '#e8c447',
          400: '#d9b328',
          500: '#c9a227',
          600: '#a6831f',
          700: '#85661b',
          800: '#634d16',
          900: '#423411',
        },
        'tcm-red': {
          DEFAULT: '#c41e3a',
          50: '#fdf2f4',
          100: '#f9d8de',
          200: '#f0b0bd',
          300: '#e8889c',
          400: '#dc5f7a',
          500: '#c41e3a',
          600: '#a31830',
          700: '#821326',
          800: '#620e1d',
          900: '#410914',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Noto Serif SC', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'tcm': '0 4px 6px -1px rgba(45, 90, 39, 0.1), 0 2px 4px -1px rgba(45, 90, 39, 0.06)',
        'tcm-lg': '0 10px 15px -3px rgba(45, 90, 39, 0.15), 0 4px 6px -2px rgba(45, 90, 39, 0.1)',
        'tcm-xl': '0 20px 25px -5px rgba(45, 90, 39, 0.15), 0 10px 10px -5px rgba(45, 90, 39, 0.1)',
        'mobile': '0 -4px 20px rgba(0, 0, 0, 0.1)',
        'fab': '0 4px 12px rgba(45, 90, 39, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionTimingFunction: {
        'mobile': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      minHeight: {
        'touch': '44px',
        'button': '56px',
      },
      fontSize: {
        'mobile-base': ['17px', '1.5'],
        'mobile-lg': ['19px', '1.4'],
        'mobile-xl': ['22px', '1.3'],
      },
      backdropBlur: {
        'mobile': '10px',
      },
    },
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    // Safe area plugin for mobile notches
    function({ addUtilities }) {
      addUtilities({
        '.safe-area-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-area-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-area-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-area-x': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-area-y': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-area-all': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
      })
    },
  ],
}

export default config
