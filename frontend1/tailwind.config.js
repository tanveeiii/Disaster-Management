/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0f172a', 
          800: '#1e293b', 
          700: '#334155', 
        },
        emerald: {
          500: '#10b981', 
        },
        amber: {
          500: '#f59e0b', 
        },
        crimson: {
          600: '#dc2626', 
        }
      },
    },
  },
  plugins: [],
}