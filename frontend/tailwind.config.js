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
        "firs-black": ["TT-Firs-Black"],
        "firs-regular": ["TT-Firs-Regular"],
        "firs-medium": ["TT-Firs-Medium"],
        "firs-semibold": ["TT-Firs-DemiBold"],
        "firs-bold": ["TT-Firs-Bold"],
      },
      colors: {
        canvas: "#09090B",
        surface: {
          DEFAULT: "#121214",
          elevated: "#141416",
          muted: "#1B1B1F",
          strong: "#17171A",
          soft: "#101012",
          contrast: "#FFFFFF",
        },
        outline: {
          DEFAULT: "#26262B",
          subtle: "rgba(255,255,255,0.08)",
          strong: "#303038",
          inverse: "rgba(0,0,0,0.06)",
        },
        foreground: {
          DEFAULT: "#FFFFFF",
          soft: "#E4E4E7",
          muted: "#A1A1AA",
          subtle: "#71717A",
          inverse: "#111111",
        },
        brand: {
          primary: "#FF6B00",
          strong: "#FF7B00",
          soft: "#311809",
        },
        success: {
          DEFAULT: "#A6FF00",
          soft: "#28340A",
        },
        danger: {
          DEFAULT: "#FB7185",
          soft: "rgba(251,113,133,0.12)",
        },
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
