import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FAF7F2',
          secondary: '#F4EFE6',
          elevated: '#FFFFFF',
        },
        ink: {
          primary: '#2A2A2A',
          secondary: '#5C5751',
          muted: '#8B857E',
        },
        accent: {
          olympian: '#B8860B',
          titan: '#6B4F8C',
          hero: '#9C2A2A',
          underworld: '#4A5258',
          primordial: '#5C6B5C',
          other: '#8B6F47',
        },
      },
      borderColor: {
        soft: 'rgba(0,0,0,0.06)',
        medium: 'rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', '-apple-system', 'sans-serif'],
        greek: ['var(--font-noto-serif)', 'Georgia', 'serif'],
        latin: ['var(--font-garamond)', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '8px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};

export default config;
