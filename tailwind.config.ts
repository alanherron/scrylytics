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
        bg: '#0b0b10',
        ink: '#e9e7f2',
        fire:  { 50:'#fff7ed',300:'#fbbf24',400:'#f59e0b',500:'#ea580c' },
        earth: { 50:'#ecfdf5',300:'#34d399',400:'#10b981',600:'#0f766e' },
        air:   { 50:'#eff6ff',300:'#7bd3f7',400:'#60a5fa',500:'#38bdf8' },
        water: { 50:'#eef2ff',300:'#5dd6d3',400:'#22d3ee',600:'#2955c5' },
        aether:{ 50:'#f7f1e8',300:'#e9d5ff',400:'#c4b5fd',600:'#b68cf2' },
      },
      boxShadow: {
        glow: '0 0 40px 8px rgba(255,255,255,0.08)',
        ember: '0 0 40px 8px rgba(251,191,36,0.25)',
      },
    },
  },
  darkMode: ['class'],
  plugins: [],
};
export default config;
