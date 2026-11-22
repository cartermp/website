import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

export const collections = {
  posts: defineCollection({
    loader: glob({ base: "./content/posts", pattern: "**/*.md" }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      tags: z.string().default("").transform((tags) => tags.split(",").map((tag) => tag.trim()).filter(Boolean)),
    }),
  }),
}
