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
        sans: ['var(--font-mono)', 'Courier New', 'monospace'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      colors: {
        retro: {
          bg: '#0c0c0c',
          surface: '#0f1c14',
          border: '#1e3a24',
          text: '#00e060',
          muted: '#3d7a51',
          accent: '#4aff88',
          paper: '#f0e8d0',
          'paper-surface': '#e8e0c8',
          'paper-border': '#7a8f6a',
          ink: '#1a2e0a',
          'ink-muted': '#4a6240',
          'ink-accent': '#1a6e10',
        }
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
