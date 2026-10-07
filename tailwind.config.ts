import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        line: "rgb(var(--line) / .075)",
        violet: "rgb(var(--violet) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        cyan: "rgb(var(--cyan) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        amber: { DEFAULT: "rgb(var(--amber) / <alpha-value>)" },
        rose: { 300: "rgb(var(--coral) / <alpha-value>)", 400: "rgb(var(--coral) / <alpha-value>)" },
        blue: "rgb(var(--blue) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)"
      },
      opacity: { 45: ".45" },
      boxShadow: { panel: "0 12px 36px -24px rgba(0,0,0,.7)" }
    }
  },
  plugins: []
} satisfies Config;
