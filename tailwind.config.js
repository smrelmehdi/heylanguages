/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        emerald: "#50C878",
        gold: "#D4AF37",
        levantine: "#3B82F6", // Blue for Shami
      },
    },
  },
  plugins: [],
};
