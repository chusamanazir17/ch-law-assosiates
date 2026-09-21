import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#05162B",
          primary: "#05162B",
          heading: "#0B1F36",
          secondary: "#102943",
          50: "#eef3f9",
          100: "#d6e0ed",
          200: "#aec2db",
          300: "#7d9bc3",
          400: "#4f72a5",
          500: "#24416e",
          600: "#183358",
          700: "#102943",
          800: "#0b1f36",
          900: "#05162b",
          950: "#030c18",
        },
        gold: {
          DEFAULT: "#D39D3D",
          primary: "#D39D3D",
          light: "#DCAA4A",
          50: "#fbf7ee",
          100: "#f5ebd2",
          200: "#ebd6a4",
          300: "#e3ba63",
          400: "#dcaa4a",
          500: "#d39d3d",
          600: "#b8832a",
          700: "#91651e",
          800: "#745019",
          900: "#5e4015",
        },
        surface: {
          white: "#FFFFFF",
          offwhite: "#F4F6F8",
          light: "#F7F9FB",
          border: "#E3E7EC",
        },
        content: {
          heading: "#0B1F36",
          body: "#657184",
          muted: "#8792A1",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        admin: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"],
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
        urdu: ["var(--font-urdu)", "system-ui", "sans-serif"],
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
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
