import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: "#09808F", deep: "#066676" },
        sun: "#FFC531",
        ink: "#17343C",
        sky: "#EAF8FA",
        cream: "#FFFBF0",
        mint: "#7ED9C6",
        coral: "#FF7A59",
        slate: "#4F6B75",
        success: "#1FA971",
        danger: "#D64545",
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        input: "14px",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(9, 128, 143, 0.14)",
        card: "0 8px 28px rgba(23, 52, 60, 0.08)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
