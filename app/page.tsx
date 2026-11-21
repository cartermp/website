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
    <div className="mx-auto max-w-[52rem]">
      <HomeIntro />

      <section aria-labelledby="posts" className="mt-9 sm:mt-12">
        <h2 id="posts" className="mb-3 px-2 font-display text-2xl font-medium tracking-tight text-ink sm:px-4">
          Posts
        </h2>
        <ul className="divide-y divide-line border-t border-line">
          {posts.map((post) => (
            <li
              key={post._id}
              className="relative grid gap-1 px-2 py-5 transition-colors hover:bg-surface focus-within:bg-surface sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6 sm:px-4"
            >
              <h3 className="font-display text-xl font-medium leading-snug tracking-tight text-ink sm:text-2xl">
                <Link
                  href={post.slug}
                  className="before:absolute before:inset-0 before:content-[''] decoration-1 underline-offset-4 hover:text-accent hover:underline focus-visible:underline"
                >
                  {post.title}
                </Link>
              </h3>
              <time dateTime={post.date} className="whitespace-nowrap text-sm leading-7 text-muted">
                {postDate.format(new Date(post.date))}
              </time>
              {post.description && (
                <p className="text-base leading-relaxed text-muted sm:col-span-2">
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
