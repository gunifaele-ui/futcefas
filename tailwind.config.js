/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fc: {
          dark: '#1E2E28',
          dark2: '#16221E',
          ink: '#1E2E28',
          lime: '#8FCB5C',
          limesoft: '#EDF4E3',
          coral: '#DF7C64',
          coraldark: '#C4664F',
          cream: '#F5F6F3',
          muted: '#98A09A',
          line: '#ECEEE9',
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
