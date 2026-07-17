/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101014",
        saffron: "#FF6A39",
        teal: "#0E7C7B",
      },
    },
  },
  plugins: [],
};
