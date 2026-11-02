# My website

https://phillipcarter.dev

## Development

Use Node.js 22 and the pnpm version pinned in `package.json`.

- `pnpm install --frozen-lockfile` installs dependencies.
- `pnpm dev` starts the development server.
- `pnpm build` exports the complete static site to `out/`.
- `pnpm lock` updates the dependency lockfile after dependency changes.

To preview the export locally, run `python3 -m http.server 8000 --directory out`
and open http://localhost:8000.

## GitHub Pages

In the repository's **Settings → Pages**, select **GitHub Actions** as the build
and deployment source. Pushes to `main` build and deploy `out/`; pull requests
check the build without deploying.

The site uses the custom domain `phillipcarter.dev`, recorded in `public/CNAME`.
Configure that custom domain in Pages settings and point its DNS to GitHub Pages.
Links and assets assume the site is served at the domain root.

RSS is exported to `/rss.xml`. If publication verification is needed, set the
repository Actions variable `STANDARD_PUBLICATION_URI` to the publication's AT URI.
The build writes it to `/.well-known/site.standard.publication` directly.

`/email/` redirects in the browser to `https://email.phillipcarter.dev/`.
GitHub Pages cannot reproduce the former server redirect for arbitrary `/email/*`
paths. The site requires no runtime database or authentication service.
