/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)'],
      },
      typography: {
        DEFAULT: {
          css: {
            pre: false, // Completely disable prose styling for pre tags
          }
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
