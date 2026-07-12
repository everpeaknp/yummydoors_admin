import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111217",
        mute: "#6d7280",
        line: "#e8ebf1",
        panel: "#ffffff",
        wash: "#f6f7fb",
        accent: "#ff5a36",
        accentSoft: "#fff0eb",
        accentDark: "#d94724"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(17, 18, 23, 0.08)"
      },
      borderRadius: {
        panel: "12px"
      }
    }
  },
  plugins: []
};

export default config;
