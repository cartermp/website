# phillipcarter.dev

Phillip Carter’s personal site, with essays on building software and working with AI, an [RSS feed](https://phillipcarter.dev/rss.xml), and [Shape Circuit](https://phillipcarter.dev/games/shape-puzzle/), a browser puzzle.

[Visit the site](https://phillipcarter.dev)

## Run locally

Use Node.js 22.19 or newer and the pnpm version pinned in [package.json](package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). The site builds without a database or any publishing credentials.

| Command | What it does |
| --- | --- |
| `pnpm lint` | Checks the source with ESLint |
| `pnpm test` | Runs Jest when tests are present |
| `pnpm build` | Builds and exports the site to `out/` |
| `pnpm lock` | Refreshes the lockfile after dependency changes |

To preview the production export, run `python3 -m http.server 8000 --directory out` after building, then open [localhost:8000](http://localhost:8000).

## Write a post

Add an MDX file to [content/posts](content/posts). Its filename becomes the URL slug, so `a-new-post.mdx` renders at `/posts/a-new-post/`.

```md
---
title: A new post
description: A short summary for the homepage and RSS feed.
date: "2026-11-21"
tags: engineering, ai
---

Write the post here.
```

Only `title` and `date` are required. Label fenced code blocks with a language such as `fsharp`, `go`, or `json` for Shiki highlighting in both themes. Put post images in [public/img](public/img) and reference them as `/img/filename.png`. Edit [about.mdx](content/pages/about.mdx) to update the homepage bio.

## Deploy

[The Pages workflow](.github/workflows/nextjs.yml) deploys `out/` on pushes to `main`. [Pull request checks](.github/workflows/ci.yml) build the site without deploying it.

For a new setup, select **GitHub Actions** under **Settings → Pages**. To use a custom domain, set it there and point its DNS to GitHub Pages. The workflow detects whether the site is served at the domain root or a project path such as `/website/`. Run the workflow again after changing the domain so the exported links and assets use the new path.

For a local project-path build, run `NEXT_PUBLIC_BASE_PATH=/website NEXT_PUBLIC_SITE_URL=https://cartermp.github.io/website pnpm build` and serve `out/` under `/website/`.

The static route `/email/` redirects to `email.phillipcarter.dev`.

[MIT license](LICENSE)
