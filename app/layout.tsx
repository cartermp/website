import Link from "next/link"
import "./globals.css"
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

export const metadata = {
  title: "Phillip Carter",
  description: "Phillip Carter's spot on the web.",
}

interface RootLayoutProps {
  children: React.ReactNode
}

function NavLinks() {
  return (
    <nav className="ml-auto text-sm font-medium flex items-center space-x-2">
      <Link
        href="/"
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400
                   hover:bg-purple-50 dark:hover:bg-purple-900/10
                   hover:text-purple-700 dark:hover:text-purple-300
                   transition-colors duration-200"
      >
        Home
      </Link>
      <Link
        href="/about"
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400
                   hover:bg-purple-50 dark:hover:bg-purple-900/10
                   hover:text-purple-700 dark:hover:text-purple-300
                   transition-colors duration-200"
      >
        About
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
    <html lang="en">
      <body
        className={`antialiased min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50 ${inter.className} ${codeFont.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="rounded-lg bg-white dark:bg-slate-950 shadow-sm">
              <div className="p-8">
                <header>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-2xl font-bold tracking-tight transition-colors duration-200">
                      PC&gt;<span className="animate-[blink_1s_steps(1)_infinite]">_</span>
                    </div>
                    <NavLinks />
                    <div className="mx-4 w-px h-6 bg-gray-200 dark:bg-gray-700" />
                    <SocialLinks />
                    <div className="mx-4 w-px h-6 bg-gray-200 dark:bg-gray-700" />
                    <ModeToggle />
                  </div>
                </header>
                <main className="mt-8">{children}</main>
              </div>
            </div>
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
