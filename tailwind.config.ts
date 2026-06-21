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
        'danfo-yellow': '#F5C518',
        'brt-green': '#2D7D46',
        'keke-orange': '#E07B39',
        'okada-red': '#C0392B',
        'ferry-blue': '#2471A3',
        'walk-gray': '#7F8C8D',
        'owa-green': '#1B6B3A',
        'owa-green-light': '#27A85A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
