import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#E0E5EC",
        clay: "#E0E5EC",
        ink: "#3D4852",
        muted: "#6B7280",
        accent: {
          DEFAULT: "#6C63FF",
          light: "#8B84FF",
        },
        teal: "#38B2AC",
        surface: {
          DEFAULT: "#E0E5EC",
          hover: "#E0E5EC",
          glass: "#E0E5EC",
        },
        border: {
          DEFAULT: "transparent",
          subtle: "transparent",
          highlight: "transparent",
        },
        primary: {
          DEFAULT: "#6C63FF",
          orange: "#6C63FF",
          coral: "#6C63FF",
          pink: "#8B84FF",
        },
        ready: "#0F766E",
        soft: "#3D4852",
      },
      fontFamily: {
        sans: [
          "var(--font-body)",
          "DM Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Plus Jakarta Sans",
          "DM Sans",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "32px",
      },
      boxShadow: {
        extruded:
          "9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)",
        "extruded-hover":
          "12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)",
        "extruded-sm":
          "5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)",
        inset:
          "inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)",
        "inset-deep":
          "inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)",
        "inset-sm":
          "inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)",
      },
      keyframes: {
        slideBar: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(280%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "slide-bar": "slideBar 1.25s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "fade-in": "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
