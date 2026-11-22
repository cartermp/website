import type { APIRoute } from "astro"
import { description, getPosts, localPath, title } from "../lib/site"

function xml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

export const GET: APIRoute = async ({ site, url }) => {
  const origin = site?.origin ?? url.origin
  const homepage = new URL(localPath("/"), origin).href.replace(/\/$/, "")
  const posts = await getPosts()
  const items = posts.map(({ id, data }) => {
    // Keep the original permalink identifiers so readers do not re-import posts.
    const permalink = xml(new URL(localPath(`/posts/${id}`), origin).href)
    return `<item>
      <title>${xml(data.title)}</title>
      ${data.description ? `<description>${xml(data.description)}</description>` : ""}
      <link>${permalink}</link>
      <guid isPermaLink="true">${permalink}</guid>
      <pubDate>${data.date.toUTCString()}</pubDate>
    </item>`
  })
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xml(title)}</title>
    <link>${xml(homepage)}</link>
    <description>${xml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${(posts[0]?.data.date ?? new Date()).toUTCString()}</lastBuildDate>
    ${items.join("\n")}
  </channel>
</rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
