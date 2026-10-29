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
        background: "#F8F7FC",
        page: "#F8F7FC",
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          light: "#F0EBFF",
          hover: "#F5F3FF",
        },
        primary: {
          DEFAULT: "#6C4DFF",
          hover: "#5B3FE6",
          deep: "#4B35B5",
          light: "#F0EBFF",
          orange: "#6C4DFF",
          coral: "#F06F73",
        },
        charcoal: {
          DEFAULT: "#242137",
          heading: "#1A172B",
          text: "#242137",
        },
        ink: "#242137",
        muted: "#68677D",
        slate: {
          DEFAULT: "#68677D",
          muted: "#68677D",
          light: "#8B89A3",
        },
        border: {
          DEFAULT: "#E7E3F0",
          subtle: "#F0EBFF",
          focus: "#6C4DFF",
        },
        accent: {
          DEFAULT: "#6C4DFF",
          purple: "#6C4DFF",
          teal: "#0F9D8A",
          blue: "#4285F4",
          amber: "#E9A23B",
          coral: "#F06F73",
        },
        teal: {
          DEFAULT: "#0F9D8A",
          light: "#E6F6F4",
        },
        blue: {
          DEFAULT: "#4285F4",
          light: "#ECF3FE",
        },
        amber: {
          DEFAULT: "#E9A23B",
          light: "#FDF5EA",
        },
        coral: {
          DEFAULT: "#F06F73",
          light: "#FEEFF0",
        },
        ready: "#0F9D8A",
        soft: "#242137",
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
        card: "20px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(36, 33, 55, 0.04), 0 4px 14px -1px rgba(108, 77, 255, 0.04)",
        "card-hover": "0 4px 12px -1px rgba(36, 33, 55, 0.06), 0 12px 24px -2px rgba(108, 77, 255, 0.08)",
        "card-elevated": "0 10px 30px -4px rgba(36, 33, 55, 0.08), 0 4px 8px -2px rgba(108, 77, 255, 0.04)",
        dropdown: "0 10px 25px -3px rgba(36, 33, 55, 0.1), 0 4px 6px -2px rgba(36, 33, 55, 0.05)",
        "purple-sm": "0 2px 8px rgba(108, 77, 255, 0.2)",
        "purple-md": "0 4px 16px rgba(108, 77, 255, 0.25)",
        inset: "inset 0 1px 2px 0 rgba(36, 33, 55, 0.04)",
        "inset-sm": "inset 0 1px 1px 0 rgba(36, 33, 55, 0.03)",
        extruded: "0 1px 3px 0 rgba(36, 33, 55, 0.04), 0 4px 14px -1px rgba(108, 77, 255, 0.04)",
        "extruded-hover": "0 4px 12px -1px rgba(36, 33, 55, 0.06), 0 12px 24px -2px rgba(108, 77, 255, 0.08)",
        "extruded-sm": "0 1px 2px 0 rgba(36, 33, 55, 0.04)",
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
