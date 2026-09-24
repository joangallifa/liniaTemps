import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#eef4ff",
          100: "#dce7ff",
          200: "#b8ceff",
          300: "#8babff",
          400: "#5c82ff",
          500: "#3357ff",
          600: "#233fe0",
          700: "#1c31b0",
          800: "#1a2c8c",
          900: "#182873",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
