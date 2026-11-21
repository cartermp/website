import { allPages } from "@/lib/content"
import { ModeToggle } from "@/components/mode-toggle"
import { Mdx } from "@/components/mdx-components"
import {
  siBluesky as BlueskyIcon,
  siGithub as GithubIcon,
  siX as XIcon,
} from "simple-icons";

function SocialLinks() {
  return (
    <>
      <a
        href={`https://bsky.app/profile/phillipcarter.dev`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-accent"
        aria-label="Bluesky Profile"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          className="fill-muted
                     hover:fill-accent
                     transition-colors duration-150"
        >
          <path d={BlueskyIcon.path} />
        </svg>
      </a>
      <a
        href={`https://github.com/cartermp`}
        target="_blank"
        rel="noopener noreferrer"
        className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-accent"
        aria-label="GitHub Profile"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          className="fill-muted
                     hover:fill-accent
                     transition-colors duration-150"
        >
          <path d={GithubIcon.path} />
        </svg>
      </a>
      <a
        href="https://x.com/_cartermp"
        target="_blank"
        rel="noopener noreferrer"
        className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-accent"
        aria-label="X Profile"
      >
        <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" className="fill-current">
          <path d={XIcon.path} />
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/in/phillip-carter-4714a135"
        target="_blank"
        rel="noopener noreferrer"
        className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-accent"
        aria-label="LinkedIn Profile"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 448 512"
          className="fill-muted
                     hover:fill-accent
                     transition-colors duration-150"
        >
          <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
        </svg>
      </a>
    </>
  );
}

export function HomeIntro() {
  const bio = allPages.find((page) => page.slugAsParams === "about")?.body.raw.trim()

  return (
    <header className="home-intro rounded-[2rem_2rem_2rem_0.65rem] px-6 py-8 sm:px-10 sm:py-11">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <h1 className="font-display text-5xl leading-[0.98] font-medium tracking-[-0.055em] text-accent sm:text-7xl">
          Phillip Carter
        </h1>
        <ModeToggle />
      </div>
      {bio && (
        <section aria-label="About" className="home-about mt-6 max-w-[59ch] text-base leading-relaxed text-muted sm:text-lg">
          <Mdx source={bio} />
        </section>
      )}
      <div aria-label="Social profiles" role="group" className="mt-5 flex items-center gap-2">
        <SocialLinks />
      </div>
    </header>
  )
}
