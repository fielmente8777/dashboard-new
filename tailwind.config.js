// import { transform } from "html2canvas/dist/types/css/property-descriptors/transform";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A3A75",
        secondary: "#0A3A75",
        ternary: "#FC5F07",
        "color-1": "#D1B14E",
        "color-2": "#040404",
        "text-gray": "#747474",
        "text-light": "#ABABAB",
        "text-black": "#363636",
      },
      animation: {
        topDown: "topDown 0.2s ease-in-out forwards",
      },
      keyframes: {
        topDown: {
          "0%": { transform: "translateY(-30px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
