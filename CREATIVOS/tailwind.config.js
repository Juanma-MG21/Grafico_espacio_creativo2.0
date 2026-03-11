/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slide: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        slideRev: {
          from: { transform: "translateX(-50%)" },
          to:   { transform: "translateX(0)" },
        },
      },
      animation: {
        slide:    "slide 18s linear infinite",
        slideRev: "slideRev 22s linear infinite",
      },
    },
  },
  plugins: [],
}

