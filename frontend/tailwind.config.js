/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1117',
          card: '#1a1d27',
          accent: '#3b82f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['monospace'],
      }
    },
  },
  plugins: [],
}
