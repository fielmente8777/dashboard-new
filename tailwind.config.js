// tailwind.config.js

export default {

content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: "#152547",
        ternary: "#FC5F07",
      },
     keyframes: {
        ring: {
          '0%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(15deg)' },
          '30%': { transform: 'rotate(-10deg)' },
          '45%': { transform: 'rotate(7deg)' },
          '60%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(3deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },

      animation: {
        ring: 'ring 0.6s ease-in-out',
      },
    },
  },
};