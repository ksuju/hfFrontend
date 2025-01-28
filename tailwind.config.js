/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F26A2E',
        secondary: '#FE9B57',
        tertiary: '#C85E6A',
      }
    },
  },
  plugins: [],
}