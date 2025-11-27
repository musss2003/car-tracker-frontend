/** @type {import('tailwindcss').Config} */
export const darkMode = ['class'];

export const content = [
  './src/**/*.{js,ts,jsx,tsx}',
  './public/index.html',
  '*.{js,ts,jsx,tsx,mdx}',
  'app/**/*.{ts,tsx}',
  'components/**/*.{ts,tsx}',
];

export const theme = {
  extend: {
    colors: {
      border: '#374151', // gray-700
      input: '#1f2937', // gray-800
      ring: '#2563eb', // blue-600
      background: '#111827', // gray-900
      foreground: '#f9fafb', // gray-50
      primary: {
        DEFAULT: '#3b82f6', // blue-500
        foreground: '#ffffff',
      },
      secondary: {
        DEFAULT: '#6b7280', // gray-500
        foreground: '#ffffff',
      },
      destructive: {
        DEFAULT: '#ef4444', // red-500
        foreground: '#ffffff',
      },
      muted: {
        DEFAULT: '#9ca3af', // gray-400
        foreground: '#111827', // dark background
      },
      accent: {
        DEFAULT: '#10b981', // emerald-500
        foreground: '#ffffff',
      },
      popover: {
        DEFAULT: '#1f2937', // gray-800
        foreground: '#f9fafb',
      },
      card: {
        DEFAULT: '#1f2937', // gray-800
        foreground: '#f9fafb',
      },
      sidebar: {
        background: '#1f2937',           // dark gray
        foreground: '#f9fafb',           // text color
        accent: '#3b82f6',               // hover/active bg
        'accent-foreground': '#ffffff',  // text on hover/active
        border: '#374151',               // border color
        ring: '#2563eb',                 // focus ring
      },
    },
    borderRadius: {
      lg: '0.5rem',
      md: '0.375rem',
      sm: '0.25rem',
    },
    keyframes: {
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      'slide-in-from-left': {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      'slide-out-to-left': {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-100%)' },
      },
      'fade-in': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      'fade-out': {
        '0%': { opacity: 1 },
        '100%': { opacity: 0 },
      },
    },
    animation: {
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
      'slide-out-to-left': 'slide-out-to-left 0.3s ease-out',
      'fade-in': 'fade-in 0.3s ease-out',
      'fade-out': 'fade-out 0.3s ease-out',
    },
    spacing: {
      sidebar: '16rem',
      'sidebar-icon': '3rem',
      'sidebar-mobile': '18rem',
    },
    minHeight: {
      svh: '100svh',
    },
  },
};

export const plugins = [require('tailwindcss-animate')];
