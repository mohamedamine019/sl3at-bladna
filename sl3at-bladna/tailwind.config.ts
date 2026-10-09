import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10231A",
        brand: { DEFAULT: "#0B6B3A", dark: "#074A28", soft: "#E6F1EA", mist: "#F4F8F5" },
        flag: "#C8102E",
        line: "#DAE3DC",
        muted: "#5B6E63",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"IBM Plex Sans"', "system-ui", "Tahoma", "sans-serif"],
      },
      borderRadius: { card: "14px" },
    },
  },
  plugins: [],
};
export default config;
