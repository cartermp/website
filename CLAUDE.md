# Repository Guide

See [README.md](README.md) for setup, writing posts, and deploying the site.
Follow the build and lockfile requirements in [AGENTS.md](AGENTS.md).

## Architecture

- **Content.** [lib/content.ts](lib/content.ts) reads MDX frontmatter and derives
  slugs from filenames. The homepage uses the About page as its bio source.
- **Rendering.** [components/mdx-components.tsx](components/mdx-components.tsx)
  renders MDX and highlights fenced code blocks with Shiki at build time.
  Individual posts use a standalone reading layout.
- **Appearance.** [app/globals.css](app/globals.css) defines the shared color
  palette and typography. The site follows the system color scheme by default
  and remembers a manual choice.
- **Export.** Next.js generates static routes and assets in `out/`.
  [scripts/finalize-export.mjs](scripts/finalize-export.mjs) adds Pages metadata
  and the optional standard.site verification file. Keep routes compatible
  with static export and use [lib/site.ts](lib/site.ts) for local asset URLs
  that need the GitHub Pages base path.
