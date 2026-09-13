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
        background: "#050b15",
        surface: {
          DEFAULT: "rgba(16, 29, 48, 0.85)",
          hover: "rgba(22, 38, 62, 0.95)",
          glass: "rgba(12, 23, 38, 0.7)",
        },
        border: {
          DEFAULT: "#21304a",
          subtle: "rgba(255, 255, 255, 0.08)",
          highlight: "rgba(255, 112, 72, 0.4)",
        },
        primary: {
          DEFAULT: "#ff7048",
          orange: "#ff9438",
          coral: "#ff6e40",
          pink: "#ff405f",
        },
        ready: "#42d6a4",
        muted: "#8a99ad",
        soft: "#c2cad9",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at 78% 12%, #1d1935 0%, #050b15 35%, #030812 100%)",
        "card-gradient": "linear-gradient(130deg, rgba(16, 29, 48, 0.92) 0%, rgba(10, 19, 33, 0.78) 100%)",
        "result-gradient": "linear-gradient(125deg, #152b47 0%, #251a38 100%)",
        "accent-gradient": "linear-gradient(90deg, #ff9b35 0%, #ff6e40 50%, #ff405f 100%)",
        "accent-text": "linear-gradient(90deg, #ffffff 20%, #ff8c42 60%, #ff405f 100%)",
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
      },
      animation: {
        "slide-bar": "slideBar 1.25s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "fade-in": "fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
