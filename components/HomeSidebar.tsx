import Link from "next/link"
import { allPages } from "contentlayer/generated"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarAboutPanel } from "@/components/SidebarAboutPanel"
import {
  siBluesky as BlueskyIcon,
  siGithub as GithubIcon,
} from "simple-icons";

function getAboutParagraphs(): string[] {
  const about = allPages.find((page) => page.slugAsParams === "about")
  if (!about) {
    return []
  }

  return about.body.raw
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
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

export function HomeSidebar() {
  const aboutParagraphs = getAboutParagraphs()

  return (
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

      {/* About — sourced from content/pages/about.mdx */}
      {aboutParagraphs.length > 0 && (
        <SidebarAboutPanel className="border-b border-retro-paper-border dark:border-retro-border px-4 py-3 space-y-2">
          <div className="text-xs uppercase tracking-widest text-retro-ink-muted dark:text-retro-muted">
            -- about --
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-retro-ink dark:text-retro-text">
            {aboutParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </SidebarAboutPanel>
      )}

      {/* Links */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-xs text-retro-ink-muted dark:text-retro-muted">[links]</span>
        <div className="flex items-center gap-1">
          <SocialLinks />
          <ModeToggle />
        </div>
      </div>

    </aside>
  )
}
