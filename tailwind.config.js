/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: '#0B0B0C',
        foreground: '#F8F8F8',
        gold: '#C8A96B',
        muted: '#A7A7AB',
        card: '#141416',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
