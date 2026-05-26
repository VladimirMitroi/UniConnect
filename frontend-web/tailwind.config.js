/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2332",
        "border-light": "#cfd7e7",
        "border-dark": "#2a3447",
        "text-main-light": "#0d121b",
        "text-main-dark": "#e2e8f0",
        "text-sec-light": "#4c669a",
        "text-sec-dark": "#94a3b8",
      },
      fontFamily: {
        "display": ["Lexend", "Noto Sans", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}