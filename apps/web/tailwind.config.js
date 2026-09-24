/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        n: {
          white:   "#FFFFFF",
          bg:      "#FAFAFA",
          border:  "#E8E8E8",
          muted:   "#F2F2F2",
          subtle:  "#737373",
          body:    "#404040",
          text:    "#0A0A0A",
          indigo:  "#4F46E5",
          violet:  "#7C3AED",
          tag:     "#F0EFFE",
          "tag-text": "#4F46E5",
        },
      },
      fontFamily: {
        sans:  ["Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "Times New Roman", "serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.03em",
        tight:    "-0.02em",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
