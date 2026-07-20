/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: '#080F2C',
          dark: '#1C2654',
          mid: '#2A3468',
          light: '#3A4580',
          blue: '#424994',
          purple: '#605B9D',
          gold: '#E5B060',
          text: '#D6CABF',
          muted: '#9A8D85',
        },
      },
    },
  },
  plugins: [],
}
