import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        /* ── Dark theme tokens ── */
        bg:       "#0B1220",
        surface:  { DEFAULT: "#111827", "2": "#161F2E", "3": "#1D283A", "4": "#243042" },
        border:   { DEFAULT: "rgba(255,255,255,0.08)", strong: "rgba(255,255,255,0.14)" },
        text:     { DEFAULT: "#F8FAFC", "2": "#94A3B8", "3": "#64748B", "4": "#334155" },

        /* ── Brand ── */
        primary:  {
          DEFAULT: "#22C55E", dark: "#16A34A",
          light: "rgba(34,197,94,0.12)", glow: "rgba(34,197,94,0.20)",
          "50":"#F0FDF4","100":"#DCFCE7","200":"#BBF7D0","300":"#86EFAC",
          "400":"#4ADE80","500":"#22C55E","600":"#16A34A","700":"#15803D",
          "800":"#166534","900":"#14532D",
        },
        secondary: { DEFAULT: "#06B6D4", light: "rgba(6,182,212,0.12)" },
        accent:    { DEFAULT: "#8B5CF6", light: "rgba(139,92,246,0.12)" },

        /* ── Semantic ── */
        success: { DEFAULT: "#22C55E", light: "rgba(34,197,94,0.12)",  dark: "#16A34A" },
        warning: { DEFAULT: "#F59E0B", light: "rgba(245,158,11,0.12)", dark: "#92400E" },
        danger:  { DEFAULT: "#EF4444", light: "rgba(239,68,68,0.12)",  dark: "#B91C1C" },
        info:    { DEFAULT: "#3B82F6", light: "rgba(59,130,246,0.12)" },

        /* ── Legacy aliases (keeps existing code working) ── */
        sankalp:   { DEFAULT: "#22C55E", dark: "#16A34A", light: "rgba(34,197,94,0.12)" },
        "primary-600": "#22C55E",
        "primary-700": "#16A34A",
        "primary-500": "#4ADE80",
      },
      borderRadius: {
        xs:    "4px",
        sm:    "8px",
        DEFAULT: "12px",
        lg:    "16px",
        xl:    "20px",
        "2xl": "24px",
        "3xl": "28px",
        "4xl": "32px",
        pill:  "9999px",
        card:  "24px",
        btn:   "16px",
        input: "16px",
        dialog: "28px",
      },
      boxShadow: {
        xs:     "0 1px 2px rgba(0,0,0,0.3)",
        sm:     "0 2px 4px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.25)",
        md:     "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)",
        lg:     "0 8px 24px rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.3)",
        xl:     "0 16px 48px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.35)",
        card:   "0 0 0 1px rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.35)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.45)",
        "glow-green": "0 0 20px rgba(34,197,94,0.25), 0 4px 12px rgba(34,197,94,0.15)",
        "glow-blue":  "0 0 20px rgba(59,130,246,0.25), 0 4px 12px rgba(59,130,246,0.15)",
        dropdown: "0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
      },
      spacing: {
        sidebar:    "280px",
        "sidebar-sm": "72px",
      },
      animation: {
        "fade-in":      "fadeIn 300ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-up":   "fadeInUp 350ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-down": "fadeInDown 300ms cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":     "scaleIn 250ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-right":  "slideInRight 300ms cubic-bezier(0.16,1,0.3,1) both",
        shimmer:        "shimmer 1.8s ease-in-out infinite",
        "ring-pulse":   "ringPulse 1.6s ease-in-out infinite",
        "float-node":   "floatNode 4s ease-in-out infinite",
        blob:           "blob 8s ease-in-out infinite",
        spin:           "spin 700ms linear infinite",
        "slide-up":     "slideUp 350ms cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        fadeIn:       { from:{opacity:"0"}, to:{opacity:"1"} },
        fadeInUp:     { from:{opacity:"0",transform:"translateY(16px)"}, to:{opacity:"1",transform:"translateY(0)"} },
        fadeInDown:   { from:{opacity:"0",transform:"translateY(-12px)"}, to:{opacity:"1",transform:"translateY(0)"} },
        scaleIn:      { from:{opacity:"0",transform:"scale(0.92)"}, to:{opacity:"1",transform:"scale(1)"} },
        slideInRight: { from:{opacity:"0",transform:"translateX(24px)"}, to:{opacity:"1",transform:"translateX(0)"} },
        slideUp:      { from:{opacity:"0",transform:"translateY(24px)"}, to:{opacity:"1",transform:"translateY(0)"} },
        shimmer:      { "0%":{backgroundPosition:"-300% 0"},"100%":{backgroundPosition:"300% 0"} },
        ringPulse:    { "0%":{transform:"scale(1)",opacity:"0.8"},"50%":{transform:"scale(1.2)",opacity:"0.3"},"100%":{transform:"scale(1.4)",opacity:"0"} },
        floatNode:    { "0%,100%":{transform:"translateY(0)"},"50%":{transform:"translateY(-10px)"} },
        blob:         { "0%,100%":{borderRadius:"60% 40% 30% 70%/60% 30% 70% 40%"},"50%":{borderRadius:"30% 60% 70% 40%/50% 60% 30% 60%"} },
        spin:         { from:{transform:"rotate(0deg)"},to:{transform:"rotate(360deg)"} },
      },
    },
  },
  plugins: [],
};

export default config;
