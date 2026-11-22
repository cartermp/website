import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const page = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export const collections = {
  pages: defineCollection({
    loader: glob({ base: "./content/pages", pattern: "**/*.md" }),
    schema: page,
  }),
  posts: defineCollection({
    loader: glob({ base: "./content/posts", pattern: "**/*.md" }),
    schema: page.extend({
      date: z.coerce.date(),
      tags: z.string().default("").transform((tags) => tags.split(",").map((tag) => tag.trim()).filter(Boolean)),
    }),
  }),
}
