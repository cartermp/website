# Repository Guide

See [README.md](README.md) for setup, writing posts, and deploying the site.
Follow the build and lockfile requirements in [AGENTS.md](AGENTS.md).

- [Content collections](src/content.config.ts) validate the Markdown in
  `content/`. The homepage renders `content/pages/about.md` as the bio.
- [Astro pages](src/pages) generate static posts, tag pages, and RSS.
  Preserve existing URLs and RSS item identifiers when changing routes.
- [Global CSS](src/styles/global.css) defines both color palettes.
  [The site layout](src/layouts/SiteLayout.astro) applies the system theme
  or the reader’s saved preference before the page renders.
- [Astro config](astro.config.mjs) sets up Tailwind, Shiki, and Pages base
  paths. GitHub Pages publishes the `out/` export.
