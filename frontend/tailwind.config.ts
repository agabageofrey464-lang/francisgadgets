import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Purple -- primary brand color, from the Francis Gadgets Technologies logo.
        brand: {
          50: "#f8f0fc",
          100: "#efdcf8",
          200: "#deb8f1",
          300: "#c98ce7",
          400: "#b063da",
          500: "#9b44c7",
          600: "#8532ad",
          700: "#6c288c",
          800: "#582171",
          900: "#481d5b",
          950: "#2c0f39",
        },
        // Orange -- secondary accent, from the logo's sparkle/swoosh.
        accent: {
          50: "#fff5ea",
          100: "#ffe6c4",
          200: "#ffc888",
          300: "#ffa64d",
          400: "#fb8724",
          500: "#f2680f",
          600: "#d9500a",
          700: "#b33d0b",
          800: "#8f3210",
          900: "#762c12",
          950: "#411206",
        },
        ink: {
          900: "#0b0f19",
          800: "#151b2c",
          700: "#232a3d",
        },
      },
      backgroundImage: {
        "brand-flag": "linear-gradient(90deg, #8532ad 0%, #9b44c7 45%, #f2680f 100%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
