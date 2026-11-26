import type { APIRoute } from "astro"
import { canonicalUrl, getPosts, postPath, tagPath } from "../lib/site"

export const GET: APIRoute = async () => {
  const posts = await getPosts()
  const tags = new Set(posts.flatMap(({ data }) => data.tags))
  const paths = ["/", "/about/", ...posts.map(({ id }) => postPath(id)), ...Array.from(tags, tagPath)]
  const urls = paths.map((path) => `  <url><loc>${canonicalUrl(path)}</loc></url>`).join("\n")
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`, { headers: { "Content-Type": "application/xml; charset=utf-8" } })
}
