/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta Grupo Proman Engenharia (logo)
        proman: {
          black: '#000000',
          green: '#2F523E',
          white: '#FFFFFF',
          grey: '#808080',
          orange: '#E58B2E',
          // tons para UI
          greenLight: '#3d6b4f',
          greenDark: '#1e3526',
          orangeLight: '#f0a04a',
          orangeDark: '#c47220',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
