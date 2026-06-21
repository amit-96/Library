/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e1ebff',
          200: '#bcd3ff',
          300: '#96bdff',
          400: '#4a8eff',
          500: '#0B2E6B', // Nalanda primary dark blue
          600: '#092557',
          700: '#071c42',
          800: '#05132e',
          900: '#020a19',
          950: '#01050d',
        }
      }
    },
  },
  plugins: [],
}
