import type { Config } from "tailwindcss";

// Brand tokens, taken from the Territory Spotless logo (roof navy, vacuum blue, swoosh green),
// toned down for a calm, clean look. "sand" is a warm off-white for alternating sections.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0F2D4F", deep: "#0A1F38", soft: "#1B4170" },
        brand: { DEFAULT: "#1F63B4", dark: "#174E8F", light: "#EEF4FB" },
        sky: { DEFAULT: "#5AA6E6", soft: "#E1EEFB" },
        leaf: { DEFAULT: "#2F9E4F", dark: "#217A3A", soft: "#E7F5EB" },
        sun: { DEFAULT: "#F2B544", soft: "#FDF4DF" },
        ink: "#13202F",
        slate: "#566476",
        mist: "#F5F7FA",
        line: "#E5EAF0",
        sand: "#FAF8F4",
        danger: "#C6362F",
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        input: "14px",
      },
      boxShadow: {
        soft: "0 20px 50px -24px rgba(15, 32, 52, 0.30)",
        card: "0 1px 2px rgba(15, 32, 52, 0.04), 0 8px 24px -14px rgba(15, 32, 52, 0.18)",
        lift: "0 2px 4px rgba(15, 32, 52, 0.05), 0 24px 48px -22px rgba(15, 32, 52, 0.35)",
        glow: "0 0 0 6px rgba(31, 99, 180, 0.12)",
      },
      keyframes: {
        twinkle: { "0%,100%": { opacity: "1", transform: "scale(1) rotate(0deg)" }, "50%": { opacity: ".45", transform: "scale(.75) rotate(20deg)" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        sweep: { "0%": { transform: "translateX(-10%)" }, "50%": { transform: "translateX(70%)" }, "100%": { transform: "translateX(-10%)" } },
        reveal: { "0%": { clipPath: "inset(0 100% 0 0)" }, "50%": { clipPath: "inset(0 15% 0 0)" }, "100%": { clipPath: "inset(0 100% 0 0)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        rise: { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        kenburns: { "0%": { transform: "scale(1.04) translate(0, 0)" }, "100%": { transform: "scale(1.14) translate(-2%, -2%)" } },
      },
      animation: {
        twinkle: "twinkle 2.8s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
        sweep: "sweep 7s ease-in-out infinite",
        reveal: "reveal 7s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        rise: "rise .6s ease-out both",
        kenburns: "kenburns 18s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
