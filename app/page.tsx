import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"
import { TagList } from "@/components/TagList"

export default function Home() {
  allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-retro-ink-muted dark:text-retro-muted">
        <span className="flex-1 border-t border-retro-paper-border dark:border-retro-border" />
        <span>[ log ]</span>
        <span className="flex-1 border-t border-retro-paper-border dark:border-retro-border" />
      </div>
      <ul className="space-y-3">
        {allPosts.map((post, index) => (
          <li key={post._id}
            className="relative border border-retro-paper-border dark:border-retro-border
                       hover:bg-retro-paper-surface dark:hover:bg-retro-surface
                       transition-colors duration-150"
          >
            {/* Full-card link overlay */}
            <Link href={post.slug} className="absolute inset-0 z-[1]" aria-label={post.title} />
            <div className="relative p-4 pointer-events-none">
              <div className="flex items-center gap-2 text-xs text-retro-ink-muted dark:text-retro-muted mb-2">
                <span>{String(index + 1).padStart(2, "0")}.</span>
                <span className="flex-1 border-t border-retro-paper-border dark:border-retro-border" />
                <time>{new Date(post.date).toLocaleDateString()}</time>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold leading-snug text-retro-ink-accent dark:text-retro-accent">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-xs text-retro-ink-muted dark:text-retro-muted leading-relaxed">
                    {post.description}
                  </p>
                )}
                {post.tags && (
                  <div className="relative z-[2] pointer-events-auto">
                    <TagList tags={post.tags} />
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
