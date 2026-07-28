/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fc: {
          // Cores de marca: fixas (botões, badges, ícones sólidos).
          dark: '#26281F',
          dark2: '#1B1D16',
          lime: '#7C9C77',
          coral: '#A25D45',
          coraldark: '#82492F',
          // Cores de superfície/neutras: variáveis CSS (ver index.css).
          ink: 'rgb(var(--fc-ink) / <alpha-value>)',
          limesoft: 'rgb(var(--fc-limesoft) / <alpha-value>)',
          cream: 'rgb(var(--fc-cream) / <alpha-value>)',
          muted: 'rgb(var(--fc-muted) / <alpha-value>)',
          line: 'rgb(var(--fc-line) / <alpha-value>)',
          surface: 'rgb(var(--fc-surface) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,46,40,0.04), 0 4px 16px -8px rgba(30,46,40,0.10)',
        nav: '0 4px 24px -8px rgba(30,46,40,0.18)',
      },
    },
  },
  plugins: [],
};
