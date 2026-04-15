/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:      '#0B1929',
        navyMid:   '#1E3350',
        gold:      '#C9973F',
        goldLight: '#DEB87A',
        goldPale:  '#FFF6E8',
        cream:     '#F6F0E4',
        creamDark: '#EDE5D2',
        border:    '#E0D8CC',
      },
      fontFamily: {
        sans: ['Calibri', 'Candara', 'Segoe UI', 'Optima', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
