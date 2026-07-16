import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        panel: "var(--color-panel)",
        elevated: "var(--color-elevated)",
        cream: "var(--color-cream)",
        muted: "var(--color-muted)",
        amber: "var(--color-amber)",
        line: "var(--color-line)",
        success: "var(--color-success)",
      },
      boxShadow: {
        soft: "0 18px 55px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
