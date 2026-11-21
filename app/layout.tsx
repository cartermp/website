import type { Metadata } from "next"
import { withBasePath } from "@/lib/site"
import "./globals.css"
import { DM_Sans, Fraunces } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollToTop } from "@/components/ScrollToTop"

const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body" })
const displayFont = Fraunces({ subsets: ["latin"], variable: "--font-editorial" })

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
      <body className={`min-h-screen bg-canvas font-sans text-ink antialiased ${bodyFont.variable} ${displayFont.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ScrollToTop />
          <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
