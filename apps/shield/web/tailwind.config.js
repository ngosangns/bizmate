import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "src/**/*.{ts,js}"),
  ],
  theme: {
    extend: {
      colors: {
        shield: {
          bg: "#0c1812",
          surface: "#13251c",
          card: "#1a2f24",
          border: "#2a4638",
          ink: "#f0faf4",
          muted: "#9bb5a6",
          accent: "#228b5a",
          accentHover: "#2aa86c",
          allow: "#3dcf7a",
          allowBg: "#143325",
          flag: "#f0c14a",
          flagBg: "#3a3018",
          block: "#ff6b6b",
          blockBg: "#3a1a1a",
          warn: "#f0c14a",
        },
      },
      fontSize: {
        elder: ["1.25rem", { lineHeight: "1.55" }],
        "elder-lg": ["1.5rem", { lineHeight: "1.45" }],
        "elder-xl": ["1.75rem", { lineHeight: "1.35" }],
      },
    },
  },
  plugins: [],
};
