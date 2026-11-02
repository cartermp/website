import { mkdir, writeFile } from "node:fs/promises"

// GitHub Pages must serve Next.js's _next assets without Jekyll processing.
await writeFile("out/.nojekyll", "")

// Pages cannot apply Next.js rewrites, so publish verification at its actual URL.
const publicationUri = process.env.STANDARD_PUBLICATION_URI
if (publicationUri) {
  await mkdir("out/.well-known", { recursive: true })
  await writeFile("out/.well-known/site.standard.publication", publicationUri)
}
