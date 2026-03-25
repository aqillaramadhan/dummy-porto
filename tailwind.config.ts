import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Use as: font-display  →  Playfair Display (serif)
        display: ["var(--font-display)", "Georgia", "serif"],
        // Use as: font-body     →  Inter (sans)
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        ink:        "#0c0a07",
        parchment:  "#f2ede3",
        gold: {
          DEFAULT: "#c9a84c",
          light:   "#e8c97a",
          dark:    "#8a6520",
        },
        crimson:   "#6b1a1a",
        cobalt:    "#1a2a4a",
        marble:    "#e8e4dc",
        umber:     "#3d2b1f",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #b8943c 0%, #e8c97a 35%, #f5dfa0 60%, #c9a84c 100%)",
      },
      boxShadow: {
        gold:    "0 0 30px rgba(201,168,76,0.3), 0 0 60px rgba(201,168,76,0.15)",
        "gold-sm": "0 0 12px rgba(201,168,76,0.25)",
      },
      animation: {
        "gold-shimmer": "goldShimmer 7s ease-in-out infinite",
        "spin-slow":    "spin 30s linear infinite",
        "float":        "float 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;