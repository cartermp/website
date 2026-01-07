import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@/components/analytics"
import { ModeToggle } from "@/components/mode-toggle"
import {
  siBluesky as BlueskyIcon,
  siGithub as GithubIcon,
} from "simple-icons";

const inter = Inter({ subsets: ["latin"] })

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
        className="p-2 rounded-lg
                   hover:bg-purple-50 dark:hover:bg-purple-900/10
                   transition-colors duration-200"
        aria-label="Bluesky Profile"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          className="fill-gray-600 dark:fill-gray-400
                     hover:fill-purple-700 dark:hover:fill-purple-300
                     transition-colors duration-200"
        >
          <path d={BlueskyIcon.path} />
        </svg>
      </a>
      <a
        href={`https://github.com/cartermp`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg
                   hover:bg-purple-50 dark:hover:bg-purple-900/10
                   transition-colors duration-200"
        aria-label="GitHub Profile"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          className="fill-gray-600 dark:fill-gray-400
                     hover:fill-purple-700 dark:hover:fill-purple-300
                     transition-colors duration-200"
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
        className={`antialiased min-h-screen text-slate-900 dark:text-slate-50 ${inter.className} ${codeFont.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="relative isolate min-h-screen overflow-hidden lg:overflow-visible bg-slate-100 dark:bg-slate-950 selection:bg-lime-200 selection:text-slate-900 dark:selection:bg-emerald-400/30">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 opacity-65 mix-blend-soft-light bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_42%),radial-gradient(circle_at_82%_12%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_60%_82%,rgba(14,165,233,0.16),transparent_36%)]" />
              <div className="absolute inset-0 opacity-60 bg-[linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:160px_160px]" />
              <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(255,255,255,0.65),transparent)] dark:bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(255,255,255,0.08),transparent)]" />
            </div>
            <div className="relative max-w-6xl mx-auto px-6 py-12 lg:py-16">
              <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
                <aside className="h-fit lg:sticky lg:top-10 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_90px_rgba(15,23,42,0.25)] p-6 lg:p-8 space-y-8">
                  <Link
                    href="/"
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 hover:border-sky-400 dark:hover:border-sky-500 transition-colors"
                  >
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-200 via-emerald-200 to-purple-200 dark:from-sky-500/20 dark:via-emerald-500/20 dark:to-purple-500/20 text-lg font-bold text-slate-900 dark:text-slate-50 shadow-inner shadow-white/40 dark:shadow-white/5">
                      PC
                      <span className="absolute inset-0 rounded-2xl border border-white/50 dark:border-white/10" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-sm text-slate-500 dark:text-slate-400">/blog</span>
                      <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        Phillip Carter
                      </span>
                    </div>
                  </Link>

                  <div className="space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 px-5 py-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">About</div>
                    <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      <p>In my day job, I’m a PM Director at Salesforce working on their Automations platform. I used to work at Honeycomb, where I led AI efforts. Prior to this, I worked on Honeycomb&apos;s telemetry pipeline, OpenTelemetry efforts, and API. I also worked on the .NET team at Microsoft for several years, including 5 years as the PM for the F# programming language and tools.</p>
                      <p>I’m also a maintainer in the OpenTelemetry project, primarily focusing on the website. I do occasionally send PRs to other parts of the project, though. I will occasionally release updates to some packages I still maintain.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span className="h-3 w-3 rounded-sm bg-slate-300 dark:bg-slate-700" />
                      <span>links</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <SocialLinks />
                      <ModeToggle />
                    </div>
                  </div>
                </aside>

                <div className="space-y-6">
                  <div className="rounded-[32px] border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_90px_rgba(15,23,42,0.25)]">
                    <div className="relative overflow-hidden rounded-[28px] border border-slate-100/80 dark:border-slate-800/80">
                      <div className="absolute -inset-x-10 -top-10 h-40 bg-gradient-to-br from-sky-200/50 via-transparent to-purple-200/40 dark:from-sky-500/15 dark:via-transparent dark:to-purple-500/15 blur-3xl" />
                      <div className="absolute inset-0 border border-white/60 dark:border-white/5 rounded-[28px] pointer-events-none" />
                      <div className="relative p-7 sm:p-9 lg:p-12">
                        <main>{children}</main>
                      </div>
                    </div>
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
