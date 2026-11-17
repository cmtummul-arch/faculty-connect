/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        ambient: '0 20px 60px rgba(15, 46, 54, 0.15)',
      },
    },
  },
  plugins: [],
}
