import { getCollection } from "astro:content"

const base = import.meta.env.BASE_URL.replace(/\/$/, "")

export const title = "Phillip Carter"
export const description = "Phillip Carter's spot on the web."

export function localPath(path: string) {
  return `${base}${path}`
}

export function postPath(id: string) {
  return localPath(`/posts/${id}/`)
}

export function tagPath(tag: string) {
  return localPath(`/tags/${encodeURIComponent(tag)}/`)
}

export async function getPosts() {
  return (await getCollection("posts")).sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}
