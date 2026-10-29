/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-canvas': '#F7F7F4',
        'brand-white': '#FFFFFF',
        'brand-dark': '#111111',
        'brand-muted': '#666666',
        'brand-light-muted': '#888888',
        'brand-btn': '#111A18',
        'brand-divider': '#D9D9D5',
        'brand-accent': '#B8A58A',
        'brand-ivory': '#FAF9F5',
        'brand-card-bg': '#FDFDFB',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'canvas': '0 20px 60px -15px rgba(0, 0, 0, 0.07), 0 0 1px 1px rgba(0, 0, 0, 0.03)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.08)',
      },
      letterSpacing: {
        'widest-plus': '0.2em',
        'editorial': '-0.02em',
      }
    },
  },
  plugins: [],
}
