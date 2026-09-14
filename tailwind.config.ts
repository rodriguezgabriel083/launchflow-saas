import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0b0f17",
        panel: "#111827",
        elevated: "#182132",
        line: "rgba(255,255,255,.075)",
        violet: "#9b75ff",
        blue: "#60a5fa",
        mint: "#4edea3"
      },
      boxShadow: { panel: "0 1px 3px rgba(0,0,0,.4)" }
    }
  },
  plugins: []
} satisfies Config;
