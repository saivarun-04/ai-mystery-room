/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "midnight-navy": {
          DEFAULT: "#0B1020",
          50: "#1a2030",
          100: "#2a3040",
          900: "#060a14",
        },
        charcoal: {
          DEFAULT: "#161B2B",
          50: "#252a3a",
          100: "#353a4a",
          900: "#0a0f1a",
        },
        burgundy: {
          DEFAULT: "#6B1F2A",
          50: "#8a3e49",
          100: "#a95d68",
          200: "#c87c87",
          900: "#3d0f17",
        },
        "antique-gold": {
          DEFAULT: "#C9A24B",
          50: "#dfc07a",
          100: "#e5cc93",
          200: "#eccca3",
          900: "#6b4a20",
        },
        paper: {
          DEFAULT: "#E9E1CF",
          50: "#f5f1e8",
          100: "#f0ebe0",
          200: "#ece6d6",
          900: "#b8b09a",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "'Cormorant'", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "spotlight-slow": "spotlight 8s ease-in-out infinite alternate",
        "grain-shift": "grain 4s steps(28) infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: "0.03", transform: "translateX(-5%) translateY(2%)" },
          "100%": { opacity: "0.07", transform: "translateX(5%) translateY(-2%)" },
        },
        grain: {
          "0%": { transform: "translate(0,0)" },
          "100%": { transform: "translate(-10%, -10%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "cinematic": "0 4px 30px rgba(0, 0, 0, 0.5), 0 0 80px rgba(201, 162, 75, 0.03)",
        "glow-gold": "0 0 20px rgba(201, 162, 75, 0.15), 0 0 40px rgba(201, 162, 75, 0.05)",
        "glow-burgundy": "0 0 20px rgba(107, 31, 42, 0.4), 0 0 40px rgba(107, 31, 42, 0.1)",
      },
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
