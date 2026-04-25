/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../shared/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#0a0a0a',
        elev: '#141414',
        line: '#1f1f1f',
        brand: {
          50: '#ecfccb',
          400: '#d4ff3a',
          500: '#c4f000',
          600: '#a3d100',
          700: '#86b300',
        },
      },
    },
  },
  plugins: [],
};
