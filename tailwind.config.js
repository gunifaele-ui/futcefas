/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fc: {
          dark: '#173430',
          dark2: '#0f2320',
          ink: '#173430',
          lime: '#b4e35f',
          limesoft: '#ddf2ae',
          coral: '#ff6f52',
          coraldark: '#e6553a',
          cream: '#f4f1ea',
          muted: '#8c9490',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
