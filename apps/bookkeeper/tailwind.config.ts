import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f6f1e8",
        card: "#fffdf8",
        ink: "#1a1a1a",
        muted: "#5c5c5c",
        accent: {
          DEFAULT: "#0d6e4f",
          soft: "#d1fae5",
          ring: "#a7f3d0",
        },
        warn: {
          DEFAULT: "#b45309",
          soft: "#fff7ed",
          border: "#fdba74",
        },
        danger: {
          DEFAULT: "#b91c1c",
          soft: "#fee2e2",
          border: "#fecaca",
        },
        ok: "#047857",
        border: "#e5ddd0",
        sand: "#fef3c7",
        amber: {
          soft: "#fffbeb",
          border: "#fcd34d",
        },
      },
      borderRadius: {
        lg: "14px",
        md: "12px",
        sm: "10px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,26,26,0.04), 0 4px 16px rgba(13,110,79,0.06)",
        card: "0 1px 3px rgba(26,26,26,0.05), 0 8px 24px rgba(26,26,26,0.04)",
      },
      fontFamily: {
        sans: ['"Segoe UI"', "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        phone: "390px",
      },
    },
  },
  plugins: [],
};

export default config;
