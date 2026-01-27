/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4AF37', // Gold
          50: '#F9F6EC',
          100: '#F3EDD9',
          200: '#E8DBB3',
          300: '#DCC98D',
          400: '#D0B767',
          500: '#D4AF37', // Main gold
          600: '#B89520',
          700: '#8B7018',
          800: '#5E4B10',
          900: '#312608',
        },
        secondary: {
          DEFAULT: '#1a1a1a', // Dark
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#808080',
          500: '#666666',
          600: '#4d4d4d',
          700: '#333333',
          800: '#1a1a1a', // Main dark
          900: '#0d0d0d',
        },
        accent: {
          DEFAULT: '#ffffff',
          muted: '#f8f8f8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}