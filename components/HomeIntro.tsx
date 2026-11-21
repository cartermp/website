import { allPages } from "@/lib/content"
import { ModeToggle } from "@/components/mode-toggle"
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

export function HomeIntro() {
  const aboutParagraphs = getAboutParagraphs()

  return (
    <header className="border border-t-4 border-retro-paper-border border-t-retro-ink-accent bg-retro-paper-surface px-5 py-6 sm:px-8 sm:py-8 dark:border-retro-border dark:border-t-retro-accent dark:bg-retro-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Phillip Carter</h1>
        <div className="flex items-center gap-3">
          <div aria-label="Social profiles" role="group" className="flex items-center gap-2">
            <SocialLinks />
          </div>
          <ModeToggle />
        </div>
      </div>
      {aboutParagraphs.length > 0 && (
        <section aria-labelledby="about" className="mt-5 max-w-[72ch]">
          <h2 id="about" className="mb-2 text-xs font-semibold uppercase tracking-widest text-retro-ink-muted dark:text-retro-muted">
            About
          </h2>
          <div className="space-y-3 text-sm leading-relaxed sm:text-base">
            {aboutParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}
    </header>
  )
}
