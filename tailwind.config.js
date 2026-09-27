/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        hand: ['Kalam', 'cursive'],
        head: ['Caveat', 'cursive'],
        note: ['"Shadows Into Light"', 'cursive'],
      },
      colors: {
        paper: '#fefdf6',
        rule: '#d9e6f0',
        margin: '#f5b7b1',
        ink: '#1a2f5c',
        accent: '#c0392b',
        accent2: '#8e44ad',
        good: '#27ae60',
        bad: '#c0392b',
      },
    },
  },
  plugins: [],
};
