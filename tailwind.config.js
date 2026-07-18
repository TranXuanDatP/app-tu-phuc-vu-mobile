/** @type {import('tailwindcss').Config} */
// NativeWind v4 — preset must be first. Tailwind v3 (RGB-channel colors for opacity support).
// Ported from web FE globals.css (@theme inline) — see src/theme for source of truth.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        // design semantic colors → bg-deep / text-aqua / bg-aqua-soft etc.
        ink: "rgb(var(--ink) / <alpha-value>)",
        deep: "rgb(var(--deep) / <alpha-value>)",
        aqua: "rgb(var(--aqua) / <alpha-value>)",
        "aqua-soft": "rgb(var(--aqua-soft) / <alpha-value>)",
        foam: "rgb(var(--foam) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)",
        "mint-soft": "rgb(var(--mint-soft) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        "amber-soft": "rgb(var(--amber-soft) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        "coral-soft": "rgb(var(--coral-soft) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["BeVietnamPro", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
