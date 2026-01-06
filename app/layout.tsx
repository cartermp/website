import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@/components/analytics"
import { ModeToggle } from "@/components/mode-toggle"
import {
  siBluesky as BlueskyIcon,
  siGithub as GithubIcon,
} from "simple-icons";

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

function NavLinks() {
  return (
    <nav className="flex flex-wrap gap-2 text-[11px] sm:text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-slate-900 dark:text-slate-200">
      <Link
        href="/"
        className="nav-chip"
      >
        Home
      </Link>
      <Link
        href="/about"
        className="nav-chip"
      >
        About
      </Link>
      <Link
        href="/tags/llms"
        className="nav-chip"
      >
        Tags
      </Link>
    </nav>
  );
}

function SocialLinks() {
  return (
    <>
      <a
        href={`https://bsky.app/profile/phillipcarter.dev`}
        target="_blank"
        rel="noopener noreferrer"
        className="icon-button"
        aria-label="Bluesky Profile"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          className="fill-slate-900 dark:fill-slate-200"
        >
          <path d={BlueskyIcon.path} />
        </svg>
      </a>
      <a
        href={`https://github.com/cartermp`}
        target="_blank"
        rel="noopener noreferrer"
        className="icon-button"
        aria-label="GitHub Profile"
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          className="fill-slate-900 dark:fill-slate-200"
        >
          <path d={GithubIcon.path} />
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
        className="antialiased min-h-screen theme-canvas text-slate-900 dark:text-slate-50 font-sans"
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="absolute inset-0 overflow-hidden">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="grid-overlay" />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 text-slate-900 shadow-[0_24px_120px_-40px_rgba(0,0,0,0.65)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-white">
              <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.72),transparent_70%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.45),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,0.35),transparent_35%),radial-gradient(circle_at_30%_80%,rgba(16,185,129,0.4),transparent_45%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,0.2),transparent_35%),radial-gradient(circle_at_30%_80%,rgba(16,185,129,0.2),transparent_45%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.35),rgba(255,255,255,0)),linear-gradient(45deg,rgba(255,255,255,0.14),rgba(255,255,255,0))]" />
              </div>
              <div className="relative p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
                <header className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/60 shadow-lg shadow-purple-500/10 ring-4 ring-purple-200/60 transition-all duration-500 hover:scale-105 dark:border-white/10 dark:bg-white/10 dark:ring-purple-500/30">
                      <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(99,102,241,0.35),rgba(236,72,153,0.45),rgba(14,165,233,0.35),rgba(99,102,241,0.35))]" />
                      <div className="absolute inset-[6px] rounded-xl bg-white/90 backdrop-blur dark:bg-slate-950/70" />
                      <div className="relative flex h-full items-center justify-center font-mono text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                        PC&gt;
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.28em] text-slate-700 dark:text-slate-300">
                        Phillip Carter
                      </p>
                      <h1 className="font-display text-2xl sm:text-3xl leading-tight text-slate-900 dark:text-white">
                        Contrarian notes on building systems that feel hand-crafted
                      </h1>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Engineering, writing, and experiments stitched together like a bespoke instrument panel.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                    <NavLinks />
                    <div className="hidden h-8 w-px bg-slate-300/60 dark:bg-white/10 lg:block" />
                    <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
                      <SocialLinks />
                      <div className="h-6 w-px bg-slate-200/70 dark:bg-white/10" />
                      <ModeToggle />
                    </div>
                  </div>
                </header>
                <div className="rounded-2xl border border-white/30 bg-white/70 p-4 shadow-inner shadow-purple-500/5 backdrop-blur-lg dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2 rounded-full bg-purple-500/15 px-4 py-2 text-purple-900 dark:text-purple-200">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-600 shadow-[0_0_0_6px_rgba(168,85,247,0.25)]" />
                      Live Signal
                    </span>
                    <span className="chip-ghost">Writing lab</span>
                    <span className="chip-ghost">Code experiments</span>
                    <span className="chip-ghost">Systems intuition</span>
                  </div>
                </div>
                <main className="relative">{children}</main>
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
