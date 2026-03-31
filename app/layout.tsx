import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@/components/analytics"
import { ModeToggle } from "@/components/mode-toggle"
import { ScrollToTop } from "@/components/ScrollToTop"
import { SidebarAboutPanel } from "@/components/SidebarAboutPanel"
import {
  siBluesky as BlueskyIcon,
  siGithub as GithubIcon,
} from "simple-icons";

const codeFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: "Phillip Carter",
  description: "Phillip Carter's spot on the web.",
  metadataBase: new URL("https://phillipcarter.dev"),
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

function SocialLinks() {
  return (
    <>
      <a
        href={`https://bsky.app/profile/phillipcarter.dev`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 transition-colors duration-150"
        aria-label="Bluesky Profile"
      >
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          className="fill-retro-ink-muted dark:fill-retro-muted
                     hover:fill-retro-ink-accent dark:hover:fill-retro-accent
                     transition-colors duration-150"
        >
          <path d={BlueskyIcon.path} />
        </svg>
      </a>
      <a
        href={`https://github.com/cartermp`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 transition-colors duration-150"
        aria-label="GitHub Profile"
      >
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          className="fill-retro-ink-muted dark:fill-retro-muted
                     hover:fill-retro-ink-accent dark:hover:fill-retro-accent
                     transition-colors duration-150"
        >
          <path d={GithubIcon.path} />
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/in/phillip-carter-4714a135"
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 transition-colors duration-150"
        aria-label="LinkedIn Profile"
      >
        <svg
          width={14}
          height={14}
          viewBox="0 0 448 512"
          className="fill-retro-ink-muted dark:fill-retro-muted
                     hover:fill-retro-ink-accent dark:hover:fill-retro-accent
                     transition-colors duration-150"
        >
          <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
        </svg>
      </a>
    </>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              const theme = localStorage.getItem('theme') || systemTheme;
              document.documentElement.classList.add(theme);
              document.documentElement.style.colorScheme = theme;
            } catch (e) {}
          })()
        `}} />
      </head>
      <body
        className={`min-h-screen bg-retro-paper dark:bg-retro-bg text-retro-ink dark:text-retro-text ${codeFont.variable} font-mono`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ScrollToTop />
          <div className="crt-scanlines relative min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">

                {/* Sidebar */}
                <aside className="h-fit lg:sticky lg:top-8 border border-retro-paper-border dark:border-retro-border space-y-0">

                  {/* Name / Logo */}
                  <Link
                    href="/"
                    className="flex items-center gap-3 border-b border-retro-paper-border dark:border-retro-border
                               px-4 py-3 hover:bg-retro-paper-surface dark:hover:bg-retro-surface
                               transition-colors duration-150"
                  >
                    <span className="flex h-9 w-9 items-center justify-center border border-retro-paper-border dark:border-retro-border text-xs font-bold text-retro-ink dark:text-retro-text shrink-0">
                      PC
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-retro-ink-muted dark:text-retro-muted">/blog</span>
                      <span className="text-base font-bold text-retro-ink dark:text-retro-text truncate">
                        Phillip Carter
                      </span>
                    </div>
                  </Link>

                  {/* About */}
                  <SidebarAboutPanel className="border-b border-retro-paper-border dark:border-retro-border px-4 py-3 space-y-2">
                    <div className="text-xs uppercase tracking-widest text-retro-ink-muted dark:text-retro-muted">
                      -- about --
                    </div>
                    <div className="space-y-3 text-xs leading-relaxed text-retro-ink dark:text-retro-text">
                      <p>In my day job, I&apos;m a PM Director at Salesforce working on their Automations platform. I used to work at Honeycomb, where I led AI efforts. Prior to this, I worked on Honeycomb&apos;s telemetry pipeline, OpenTelemetry efforts, and API. I also worked on the .NET team at Microsoft for several years, including 5 years as the PM for the F# programming language and tools.</p>
                      <p>I&apos;m also a maintainer in the OpenTelemetry project, primarily focusing on the website. I do occasionally send PRs to other parts of the project, though. I will occasionally release updates to some packages I still maintain.</p>
                    </div>
                  </SidebarAboutPanel>

                  {/* Links */}
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-retro-ink-muted dark:text-retro-muted">[links]</span>
                    <div className="flex items-center gap-1">
                      <SocialLinks />
                      <ModeToggle />
                    </div>
                  </div>

                </aside>

                {/* Main content */}
                <div className="min-w-0 border border-retro-paper-border dark:border-retro-border">
                  <div className="border-b border-retro-paper-border dark:border-retro-border px-4 py-1.5 text-xs text-retro-ink-muted dark:text-retro-muted">
                    phillipcarter.dev
                  </div>
                  <div className="p-5 sm:p-7">
                    <main>{children}</main>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
