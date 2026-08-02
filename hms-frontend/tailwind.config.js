/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F5F0",
        surface: "#FFFFFF",
        ink: "#1F2A24",
        primary: { DEFAULT: "#0E5C4A", soft: "#D9EBE3", dark: "#0A4436" },
        accent: { DEFAULT: "#C0673B", soft: "#F3E1D6" },
        sage: "#8FA998",
        gold: "#C6A15B",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(15, 45, 35, 0.06)",
        card: "0 4px 20px rgba(15, 45, 35, 0.08)",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};