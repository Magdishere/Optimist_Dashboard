/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6F4E37', // Coffee Brown
        secondary: '#F5DEB3', // Wheat/Crepe Color
      }
    },
  },
  plugins: [],
}