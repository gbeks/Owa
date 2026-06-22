import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Night palette (dark backgrounds)
        'owa-night':  '#12121F',
        'owa-night2': '#1A1A2E',
        'owa-night3': '#20203A',
        'owa-card':   '#252545',
        // Gold accent system
        'owa-gold':       '#C9963A',
        'owa-gold-bright':'#E2B05A',
        // Text hierarchy
        'owa-white': '#FAFAF8',
        'owa-sand':  '#C4A882',
        'owa-mist':  '#8E9BAE',
        // Vehicle colours (kept for backwards compat)
        'danfo-yellow': '#F5C518',
        'brt-green':    '#2D7D46',
        'keke-orange':  '#E07B39',
        'okada-red':    '#C0392B',
        'ferry-blue':   '#2471A3',
        'walk-gray':    '#7F8C8D',
        // Legacy (used by /about and any unvisited pages)
        'owa-green':       '#1B6B3A',
        'owa-green-light': '#27A85A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ["'Courier New'", 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
