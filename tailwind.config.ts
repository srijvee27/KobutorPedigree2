import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pedigree: {
          border: "#2f2f2f",
          male: "#5B7E3C",
          female: "#427AB5",
          orange: "#ffe3d1",
          gray: "#f1f2f3"
        }
      },
      boxShadow: {
        glass: "0 12px 35px rgba(15, 23, 42, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
