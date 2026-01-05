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
        sans: ['var(--font-sans)', 'Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
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
