/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        'editor-background': '#011627',
        'text-main': '#d6deeb',
        'accent': '#219fd5',
        'secondary-accent': '#5f7e97',
        'pacific-cyan': '#00b4d8',
        'light-blue': '#90e0ef',
        'vivid-sky-blue': '#48cae4',
        'blue-green': '#0096c7',
        'honolulu-blue': '#0077b6',
      },
    },
  },
  plugins: [],
}
