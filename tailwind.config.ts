import type { Config } from "tailwindcss";

// Brand tokens. Every colour is sampled from the Spotless NT logo:
// the roof (navy), the vacuum (blue), the sparkles (sky) and the swoosh (leaf).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B2F5E", deep: "#061C3A", soft: "#16407A" },
        brand: { DEFAULT: "#0067B1", dark: "#00508C", light: "#E8F2FB" },
        sky: { DEFAULT: "#2E9BEA", soft: "#D6ECFC" },
        leaf: { DEFAULT: "#3BA935", dark: "#24801F", soft: "#E3F5DF" },
        sun: { DEFAULT: "#FFB547", soft: "#FFF2DC" },
        ink: "#0C1B2F",
        slate: "#4A5D75",
        mist: "#F3F7FC",
        line: "#DCE6F2",
        danger: "#C6362F",
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "28px",
        input: "14px",
      },
      boxShadow: {
        soft: "0 24px 60px -20px rgba(11, 47, 94, 0.28)",
        card: "0 10px 30px -12px rgba(11, 47, 94, 0.16)",
        glow: "0 0 0 6px rgba(46, 155, 234, 0.15)",
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
