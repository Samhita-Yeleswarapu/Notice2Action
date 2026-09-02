/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2540',
        'ink-light': '#5B6478',
        paper: '#FAF8F3',
        'paper-raised': '#FFFFFF',
        manila: '#E8DCC0',
        'manila-dark': '#D8C79E',
        cork: '#8B5E3C',
        'stamp-red': '#B23A2E',
        gold: '#C08A1E',
        green: '#3E7A4C',
        line: '#DCD3BE',
      },
      fontFamily: {
        serif: ['Newsreader', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        n2a: '14px',
      },
      boxShadow: {
        n2a: '0 1px 2px rgba(27,37,64,0.06), 0 8px 24px rgba(27,37,64,0.06)',
      },
    },
  },
  plugins: [],
};
