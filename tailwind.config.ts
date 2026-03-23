import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        /** Google Sans Flex (Google Fonts → --font-body dans globals.css) */
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
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
        /** Tokens sémantiques shadcn (évite le conflit avec la palette `accent` Boutiqi) */
        uiAccent: {
          DEFAULT: "hsl(var(--ui-accent))",
          foreground: "hsl(var(--ui-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ringOffsetColor: {
          background: "hsl(var(--background))",
        },
        brand: {
          50: "#E8F5EC",
          100: "#C8E8D4",
          200: "#96D4B0",
          300: "#5FB98A",
          400: "#40916C",
          500: "#2D6A4F",
          600: "#1E6B3C",
          700: "#1A3D2B",
          800: "#122B1E",
          900: "#0A1C14",
        },
        accent: {
          50: "#FEF8F5",
          100: "#FBF0EA",
          200: "#F2CCBA",
          300: "#E8B49A",
          400: "#D4936B",
          500: "#C0714A",
          600: "#A0522D",
          700: "#7D4E24",
          800: "#5C3A1E",
          900: "#3D2410",
        },
        warm: {
          50: "#F7F5F0",
          100: "#F0EDE6",
          200: "#E0DDD5",
          300: "#C5C0B5",
          400: "#A09E95",
          500: "#6B705C",
          600: "#4A4A3A",
          700: "#3A3A2E",
          800: "#2D2B24",
          900: "#1C1A17",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(28,26,23,0.07)",
        md: "0 2px 8px rgba(28,26,23,0.09)",
        lg: "0 4px 16px rgba(28,26,23,0.10)",
        /** Ombres diffuses type dashboard « premium » (faible opacité, blur large) */
        soft: "0 4px 24px -4px rgba(15, 23, 42, 0.07), 0 8px 32px -8px rgba(15, 23, 42, 0.05)",
        "soft-sm": "0 2px 16px -2px rgba(15, 23, 42, 0.06), 0 4px 12px -4px rgba(15, 23, 42, 0.04)",
      },
      keyframes: {
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-left": {
          from: { opacity: "0", transform: "translateX(32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.3)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-down": "fade-down 0.6s ease both",
        "fade-up": "fade-up 0.7s ease both",
        "fade-left": "fade-left 0.9s ease both",
        "float-y": "float-y 4s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s ease infinite",
        "slide-up": "slide-up 0.8s ease both",
        "scale-in": "scale-in 0.6s ease both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
