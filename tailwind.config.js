/** @type {import('tailwindcss').Config} */
export const darkMode = ['class'];
export const content = [
  './src/**/*.{js,jsx,ts,tsx}',
  './public/index.html',
  '*.{js,ts,jsx,tsx,mdx}',
  'app/**/*.{ts,tsx}',
  'components/**/*.{ts,tsx}',
];
export const theme = {
  extend: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      // primary: {
      //   DEFAULT: "#3b82f6", // blue-500
      //   foreground: "#ffffff",
      // },
      // secondary: {
      //   DEFAULT: "#6b7280", // gray-500
      //   foreground: "#ffffff",
      // },
      // destructive: {
      //   DEFAULT: "#ef4444", // red-500
      //   foreground: "#ffffff",
      // },
      // muted: {
      //   DEFAULT: "#f3f4f6", // gray-100
      //   foreground: "#6b7280", // gray-500
      // },
      // accent: {
      //   DEFAULT: "#ede9fe", // purple-100
      //   foreground: "#8b5cf6", // purple-500
      // },
      // background: "#ffffff",
      // foreground: "#0f172a", // slate-900
      // card: {
      //   DEFAULT: "#ffffff",
      //   foreground: "#0f172a", // slate-900
      // },
      // border: "#e5e7eb", // gray-200
      // input: "#e5e7eb", // gray-200
      // ring: "#3b82f6", // blue-500
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
      // lg: "0.5rem",
      // md: "0.375rem",
      // sm: "0.25rem",
    },
    keyframes: {
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      "slide-in-from-left": {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(0)" },
      },
      "slide-out-to-left": {
        "0%": { transform: "translateX(0)" },
        "100%": { transform: "translateX(-100%)" },
      },
      "fade-in": {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      "fade-out": {
        "0%": { opacity: "1" },
        "100%": { opacity: "0" },
      },
    },
    animation: {
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
      "slide-out-to-left": "slide-out-to-left 0.3s ease-out",
      "fade-in": "fade-in 0.3s ease-out",
      "fade-out": "fade-out 0.3s ease-out",
    },
  },
};
export const plugins = [
  // Remove this line or comment it out:
  require("tailwindcss-animate")
];
