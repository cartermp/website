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
      animation: {
        'cursor-blink': 'blink 1s step-start infinite',
        'cursor-spin': 'spin 0.5s linear infinite', // Add this - using Tailwind's built-in spin keyframes
      },
      typography: {
        DEFAULT: {
          css: {
            pre: false,
            'code': {
              fontSize: '0.82em',
            },
            'pre code': {
              fontSize: '0.82em',
              fontFamily: 'var(--font-mono)',
            },
          }
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
