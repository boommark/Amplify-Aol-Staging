import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        slideUp: "slideUp 0.6s ease forwards",
        slideDown: "slideDown 0.6s ease forwards",
        slideLeft: "slideLeft 0.6s ease forwards",
        slideRight: "slideRight 0.6s ease forwards",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.05)",
        elevated: "0 10px 30px rgba(0, 0, 0, 0.08)",
        glow: "0 0 20px rgba(56, 114, 255, 0.5)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.4)",
        "glow-pink": "0 0 20px rgba(236, 72, 153, 0.4)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.4)",
      },
      backgroundImage: {
        "gradient-light": "radial-gradient(circle at top left, rgba(224, 242, 254, 0.5), rgba(255, 255, 255, 0))",
        "gradient-blue": "linear-gradient(135deg, #0061ff 0%, #60a5fa 100%)",
        "gradient-purple": "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
        "gradient-pink-blue": "linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)",
        "gradient-purple-blue": "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
        "gradient-rainbow": "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, #8b5cf6 0deg, #3b82f6 180deg, #10b981 360deg)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
