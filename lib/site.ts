const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

/** Prefix site-local URLs; leave external links, anchors, and already-prefixed URLs intact. */
export function withBasePath(url: string): string {
  if (!basePath || !url.startsWith("/") || url.startsWith("//")) return url
  if (url === basePath || url.startsWith(`${basePath}/`)) return url
  return `${basePath}${url}`
}
