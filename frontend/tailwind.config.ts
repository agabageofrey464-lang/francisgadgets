import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-jakarta)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Primary -- deep teal. The logo keeps its own purple/orange; the UI
        // deliberately sits beside it rather than copying it.
        // 600 is the button/link step and clears 4.5:1 on white.
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0f766e",
          700: "#115e59",
          800: "#134e4a",
          900: "#0f3d3a",
          950: "#042f2e",
        },
        // Action & urgency -- amber. 500 and up are the steps safe for white text.
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d97706",
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          900: "#713f12",
          950: "#451a03",
        },
        ink: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
        },
        // Surfaces. The shop is mostly white cards, so the page behind them
        // carries a faint brand tint -- white then reads as "raised", not default.
        surface: {
          DEFAULT: "#f4f8f8", // page background
          muted: "#e6f2f1", // banded sections, table headers
          line: "#cfe6e3", // hairlines on tinted ground
        },
      },
      backgroundImage: {
        "brand-flag": "linear-gradient(90deg, #0f766e 0%, #14b8a6 45%, #f59e0b 100%)",
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
