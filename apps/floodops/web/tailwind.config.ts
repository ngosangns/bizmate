import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1419",
        panel: "#1a2332",
        border: "#2d3a4d",
        muted: "#8b9bb4",
        flood: "#e85d4c",
        clear: "#3dba7a",
        human: "#f5a623",
        auto: "#5b8def",
        warn: "#f0c14b",
      },
      borderRadius: { lg: "12px", md: "8px", sm: "6px" },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
