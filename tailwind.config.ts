import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background — Polar Night
        "bg-base": "#242933",
        "bg-surface": "#2E3440",
        "bg-elevated": "#3B4252",
        "bg-overlay": "#434C5E",
        "nord-border": "#434C5E",
        "nord-border-strong": "#4C566A",
        // Frost — accent
        "frost-cyan": "#8FBCBB",
        frost: "#88C0D0",
        "frost-blue": "#81A1C1",
        "frost-deep": "#5E81AC",
        // Aurora — limited use
        "aurora-red": "#BF616A",
        "aurora-orange": "#D08770",
        "aurora-yellow": "#EBCB8B",
        "aurora-green": "#A3BE8C",
        "aurora-purple": "#B48EAD",
        // Text — Snow Storm
        "text-primary": "#ECEFF4",
        "text-secondary": "#D8DEE9",
        "text-muted": "#9AA4B8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundSize: {
        "200%": "200% 200%",
        "300%": "300% 300%",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
