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
