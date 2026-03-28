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
        // Cores de fundo e superfícies (Dark Mode)
        background: "#121212",
        surface: {
          DEFAULT: "#090909",
          hover: "#121212",
          elevated: "#161616",
        },
        // Cores de destaque (Orange & Lime)
        brand: {
          primary: "#FF6800", // Laranja principal do botão e cards
          secondary: "#FE3E00", // Laranja mais avermelhado para variações
          success: "#A6FF00", // Verde lima para progresso e metas
        },
        // Escala de cinzas para textos e bordas
        zinc: {
          100: "#FFFFFF", // Títulos
          200: "#E2E2E2", // Texto secundário
          400: "#C4C4C4", // Texto desativado / Muted
          700: "#909293", // Ícones e detalhes
          800: "#27272A", // Bordas sutis
          900: "#09090B", // Inputs
        },
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
