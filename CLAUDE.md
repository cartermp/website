# Repository Guide

## Development Commands

- `pnpm dev` starts the Next.js development server.
- `pnpm build` exports the site to `out/` for GitHub Pages.
- `pnpm lock` refreshes the lockfile after dependency changes.
- `pnpm test` runs Jest tests when present.

## Architecture

This is a static Next.js 15 personal website with a blog and browser games.
Contentlayer manages MDX posts in `content/posts/` and pages in `content/pages/`.
Tailwind CSS provides styling and `next-themes` handles theme switching.
`@/*` maps to the repository root. TypeScript strict mode is enabled.

All routes must support static export. There is no runtime database,
authentication, middleware, or server API. Static GET handlers are exported at
build time. `scripts/finalize-export.mjs` adds GitHub Pages metadata and optional
publication verification. See README.md for deployment setup.
