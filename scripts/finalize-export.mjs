import { writeFile } from "node:fs/promises"

// GitHub Pages must serve Next.js's _next assets without Jekyll processing.
await writeFile("out/.nojekyll", "")
