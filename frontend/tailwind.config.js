/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        black: ["TT-Firs-Black"],
        regular: ["TT-Firs-Regular"],
        medium: ["TT-Firs-Medium"],
        semibold: ["TT-Firs-DemiBold"],
        bold: ["TT-Firs-Bold"],
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
