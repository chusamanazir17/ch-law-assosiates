import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef3f9",
          100: "#d6e0ed",
          200: "#aec2db",
          300: "#7d9bc3",
          400: "#4f72a5",
          500: "#325589",
          600: "#24416e",
          700: "#1b3258",
          800: "#132543",
          900: "#0b1d38",
          950: "#061226",
        },
        gold: {
          50: "#fbf7ee",
          100: "#f5ebd2",
          200: "#ebd6a4",
          300: "#dfbb6e",
          400: "#d4a44c",
          500: "#c8973d",
          600: "#ad7831",
          700: "#8a5a2a",
          800: "#724928",
          900: "#603d25",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(11, 29, 56, 0.08)",
        "card-hover": "0 16px 48px rgba(11, 29, 56, 0.16)",
        soft: "0 2px 12px rgba(11, 29, 56, 0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
