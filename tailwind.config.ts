import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#09090b',
          card: '#121215',
          cardHover: '#18181c',
          border: '#27272a',
          borderLight: '#323238',
          text: '#F4F4F5',
          muted: '#A1A1AA',
          subtle: '#71717A',
        },
        navy: {
          50: '#F0F4F9',
          100: '#E1E9F2',
          200: '#C2D3E5',
          300: '#94B4D3',
          400: '#5E8FBE',
          500: '#386FA4',
          600: '#265484',
          700: '#1F4269',
          800: '#183153', // Primary Navy
          900: '#102037',
          950: '#0A1423',
        },
        accent: {
          50: '#EDF8F2',
          100: '#D5EFE1',
          200: '#AEE0C5',
          300: '#7ECDA4',
          400: '#45A879', // Accent Fresh Green
          500: '#348A61',
          600: '#276E4D',
          700: '#20583E',
          800: '#1B4733',
          900: '#173B2B',
        },
        softblue: {
          50: '#F5F9FE',
          100: '#EAF2FC', // Secondary Soft Blue
          200: '#D6E5FA',
          300: '#B8D4F6',
        },
        charcoal: {
          50: '#F7F8F9',
          100: '#ECEEF1',
          200: '#D8DCDE',
          300: '#B6BEC4',
          400: '#8E99A3',
          500: '#677481',
          600: '#4D5864',
          700: '#38414B',
          800: '#242B35', // Main Charcoal Text
          900: '#161B22',
        },
        offwhite: '#FAFAF8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)',
        'lift': '0 4px 12px 0 rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)',
        'lift-lg': '0 10px 25px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.05)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
};
export default config;

