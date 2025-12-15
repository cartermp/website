import { allPosts } from "contentlayer/generated"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://phillipcarter.dev"

function buildRssItem({
  title,
  description,
  slug,
  date,
}: {
  title: string
  description?: string
  slug: string
  date: string
}) {
  const postUrl = `${SITE_URL}${slug}`

  return `
    <item>
      <title><![CDATA[${title}]]></title>
      ${description ? `<description><![CDATA[${description}]]></description>` : ""}
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
    </item>
  `
}

export async function GET() {
  const items = allPosts
    .map(post => ({ ...post, _timestamp: new Date(post.date).getTime() }))
    .sort((a, b) => b._timestamp - a._timestamp)
    .map((post) =>
      buildRssItem({
        title: post.title,
        description: post.description,
        slug: post.slug,
        date: post.date,
      }),
    )
    .join("")

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title><![CDATA[Phillip Carter]]></title>
      <link>${SITE_URL}</link>
      <description><![CDATA[Phillip Carter's spot on the web.]]></description>
      <language>en-us</language>
      <lastBuildDate>${
        allPosts.length > 0
          ? new Date(
              allPosts
                .map((post) => post.date)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
            ).toUTCString()
          : new Date().toUTCString()
      }</lastBuildDate>
      ${items}
    </channel>
  </rss>`

  return new Response(feed, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  })
}
