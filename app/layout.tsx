import type { Metadata } from "next"
import { withBasePath } from "@/lib/site"
import "./globals.css"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollToTop } from "@/components/ScrollToTop"

const codeFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: "Phillip Carter",
  description: "Phillip Carter's spot on the web.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://phillipcarter.dev"),
  alternates: {
    types: {
      "application/rss+xml": withBasePath("/rss.xml"),
    },
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || 'light';
              document.documentElement.classList.add(theme);
              document.documentElement.style.colorScheme = theme;
            } catch (e) {}
          })()
        `}} />
      </head>
      <body
        className={`min-h-screen bg-retro-paper dark:bg-retro-bg text-retro-ink dark:text-retro-text ${codeFont.variable} font-mono`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ScrollToTop />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
