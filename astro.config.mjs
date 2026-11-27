import { defineConfig } from "astro/config"
import { cp, readdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { join } from "node:path"
import tailwind from "@tailwindcss/vite"
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri"

const base = (process.env.SITE_BASE_PATH ?? "").replace(/\/$/, "")
const site = process.env.SITE_URL || "https://phillipcarter.dev"

const prefixMarkdownUrls = {
  name: "site-base-path",
  element: {
    filter: ["a", "img"],
    visit(node, context) {
      const attribute = node.tagName === "img" ? "src" : "href"
      const url = node.properties?.[attribute]
      if (base && typeof url === "string" && /^\/(?!\/)/.test(url) && url !== base && !url.startsWith(`${base}/`)) {
        context.setProperty(node, attribute, `${base}${url}`)
      }
    },
  },
}

const headingPermalinks = {
  name: "heading-permalinks",
  element: {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    visit(node, context) {
      const id = node.properties?.id
      if (typeof id !== "string" || !id) return
      context.appendChild(node, {
        type: "element",
        tagName: "a",
        properties: {
          className: ["heading-permalink"],
          href: `#${encodeURIComponent(id)}`,
          ariaLabel: `Link to ${context.textContent(node)}`,
        },
        children: [],
      })
    },
  },
}

const staticTagPaths = {
  name: "static-tag-paths",
  hooks: {
    async "astro:build:done"({ dir }) {
      const tags = join(fileURLToPath(dir), "tags")
      const folders = await readdir(tags, { withFileTypes: true })
      for (const folder of folders) {
        if (!folder.isDirectory() || !folder.name.includes("%")) continue
        // Static hosts can decode the URL before looking up the file (F%23 → F#).
        const decoded = decodeURIComponent(folder.name)
        if (decoded === folder.name || decoded === "." || decoded === ".." || /[/\\]/.test(decoded)) continue
        await cp(join(tags, folder.name), join(tags, decoded), { recursive: true, force: false, errorOnExist: true })
      }
    },
  },
}

export default defineConfig({
  site,
  base: base || "/",
  trailingSlash: "always",
  outDir: "./out",
  integrations: [staticTagPaths],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      defaultColor: false,
    },
    processor: satteri({
      features: { smartPunctuation: false },
      // Run Astro's built-in slugger before adding links so existing IDs stay stable.
      hastPlugins: [prefixMarkdownUrls, satteriHeadingIdsPlugin(), headingPermalinks],
    }),
  },
  vite: { plugins: [tailwind()] },
})
