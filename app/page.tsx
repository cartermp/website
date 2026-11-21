import { HomeIntro } from "@/components/HomeIntro"
import { TagList } from "@/components/TagList"
import { allPosts } from "@/lib/content"
import Link from "next/link"

const postDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

export default function Home() {
  const posts = [...allPosts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

  return (
    <div className="mx-auto max-w-3xl">
      <HomeIntro />

      <section aria-labelledby="posts" className="mt-8 sm:mt-10">
        <h2 id="posts" className="mb-3 text-xs font-semibold uppercase tracking-widest text-retro-ink-muted dark:text-retro-muted">
          Posts
        </h2>
        <ul className="divide-y divide-retro-paper-border border-y border-retro-paper-border dark:divide-retro-border dark:border-retro-border">
          {posts.map((post) => (
            <li
              key={post._id}
              className="relative grid gap-1 px-2 py-4 transition-colors hover:bg-retro-paper-surface focus-within:bg-retro-paper-surface sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6 sm:px-4 dark:hover:bg-retro-surface dark:focus-within:bg-retro-surface"
            >
              <h3 className="text-base font-bold leading-snug text-retro-ink-accent sm:text-lg dark:text-retro-accent">
                <Link
                  href={post.slug}
                  className="before:absolute before:inset-0 before:content-[''] hover:underline focus-visible:underline"
                >
                  {post.title}
                </Link>
              </h3>
              <time dateTime={post.date} className="whitespace-nowrap text-xs leading-6 text-retro-ink-muted dark:text-retro-muted">
                {postDate.format(new Date(post.date))}
              </time>
              {post.description && (
                <p className="text-sm leading-relaxed text-retro-ink-muted sm:col-span-2 dark:text-retro-muted">
                  {post.description}
                </p>
              )}
              {post.tags && (
                <div className="relative z-10 mt-2 w-fit sm:col-span-2">
                  <TagList tags={post.tags} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
