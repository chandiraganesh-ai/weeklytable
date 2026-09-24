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
        cream: "#FBF7EE",
        "cream-dim": "#F4EFE6",
        espresso: "#2B2421",
        terracotta: {
          DEFAULT: "#C85A32",
          dark: "#A8461F",
        },
        sage: {
          DEFAULT: "#5A6E48",
          light: "#D0E7B8",
        },
        honey: "#DDA743",
        "card-border": "#EBE2D3",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
