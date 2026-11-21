import { readFileSync, readdirSync } from "node:fs"
import { join, relative, sep } from "node:path"
import matter from "gray-matter"

function readDocuments(directory: "pages" | "posts") {
  const root = join(process.cwd(), "content", directory)
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => {
      const file = join(entry.parentPath, entry.name)
      const { data, content } = matter(readFileSync(file, "utf8"))
      const id = relative(root, file).split(sep).join("/")
      if (typeof data.title !== "string") {
        throw new Error(`Missing title in ${directory}/${id}`)
      }

      const slugAsParams = id.slice(0, -".mdx".length)
      return {
        _id: `${directory}/${id}`,
        slug: `/${directory === "posts" ? "posts/" : ""}${slugAsParams}`,
        slugAsParams,
        title: data.title,
        description: typeof data.description === "string" ? data.description : undefined,
        tags: typeof data.tags === "string" ? data.tags : undefined,
        body: { raw: content },
        date: data.date,
      }
    })
}

export const allPages = readDocuments("pages")
export const allPosts = readDocuments("posts").map((post) => {
  const date = new Date(post.date)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date in ${post._id}`)
  }
  return { ...post, date: date.toISOString() }
})
