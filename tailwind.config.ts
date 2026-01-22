import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-spectral)', 'serif'],
        ui: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        background: '#0F1114',
        surface: '#1A1C20',
        text: '#FFFFFF',
        textMuted: '#9CA3AF',
        border: 'rgba(255,255,255,0.08)',
        shadow: 'rgba(0,0,0,0.3)',
        bg: '#0F1114', // Alias for backward compatibility
        ink: '#FFFFFF', // Alias for backward compatibility
        earth: {
          base: '#388E3C',
          accent: '#8BC34A',
          50: '#e8f5e9',
          300: '#66bb6a',
          400: '#388E3C',
          600: '#2e7d32',
        },
        water: {
          base: '#0288D1',
          accent: '#26C6DA',
          50: '#e1f5fe',
          300: '#4fc3f7',
          400: '#0288D1',
          600: '#0277bd',
        },
        fire: {
          base: '#E53935',
          accent: '#FF7043',
          50: '#ffebee',
          300: '#e57373',
          400: '#E53935',
          500: '#d32f2f',
        },
        air: {
          base: '#6A1B9A',
          accent: '#9C27B0',
          50: '#f3e5f5',
          300: '#ba68c8',
          400: '#6A1B9A',
          500: '#9C27B0',
        },
        aether: {
          50: '#f7f1e8',
          300: '#e9d5ff',
          400: '#c4b5fd',
          600: '#b68cf2',
        },
      },
      boxShadow: {
        glow: '0 0 40px 8px rgba(255,255,255,0.08)',
        ember: '0 0 40px 8px rgba(251,191,36,0.25)',
        scry: '0 2px 10px rgba(0,0,0,0.25)',
      },
      backgroundImage: {
        'earth-gradient': 'linear-gradient(135deg, #388E3C, #8BC34A)',
        'water-gradient': 'linear-gradient(135deg, #0288D1, #26C6DA)',
        'fire-gradient': 'linear-gradient(135deg, #E53935, #FF7043)',
        'air-gradient': 'linear-gradient(135deg, #6A1B9A, #9C27B0)',
      },
    },
  },
  darkMode: ['class'],
  plugins: [],
};
export default config;
