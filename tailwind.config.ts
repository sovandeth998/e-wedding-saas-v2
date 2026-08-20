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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          50: "#fdf8ef",
          100: "#f9edcf",
          200: "#f3d99e",
          300: "#e9be5e",
          400: "#e2a832",
          500: "#d4911a",
          600: "#b87212",
          700: "#985411",
          800: "#7d4315",
          900: "#683814",
        },
      },
      fontFamily: {
        kantumruy: ["var(--font-kantumruy)", "Noto Sans Khmer", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, hsl(38, 76%, 40%) 0%, hsl(38, 60%, 55%) 50%, hsl(38, 76%, 40%) 100%)",
        "dark-gradient": "linear-gradient(135deg, hsl(30, 8%, 10%) 0%, hsl(30, 8%, 18%) 100%)",
        "cream-gradient": "linear-gradient(180deg, hsl(40, 33%, 98%) 0%, hsl(40, 20%, 94%) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
