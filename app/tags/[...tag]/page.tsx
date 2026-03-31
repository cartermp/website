import { allPosts } from 'contentlayer/generated'
import { notFound } from 'next/navigation';
import Link from 'next/link'
import { TagList } from '@/components/TagList'
import { use } from 'react'

// Define params type for Next.js 15
type TagPageParams = Promise<{ tag: string[] }>;

export async function generateStaticParams(): Promise<{ tag: string[] }[]> {
  const tags = new Set(allPosts.flatMap(post => 
    post.tags?.split(',').map(tag => tag.trim()) ?? []
  ))
  
  return Array.from(tags).map((tag) => ({
    tag: [tag],
  }))
}

export default function TagPage(props: { params: TagPageParams }) {
  const params = use(props.params);
  const tag = params.tag[0]
  
  const posts = allPosts
    .filter(post => post.tags?.split(',').map(t => t.trim()).includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-base font-bold text-retro-ink-accent dark:text-retro-accent">
          Posts tagged with &quot;{tag}&quot;
        </h1>
        <p className="text-xs text-retro-ink-muted dark:text-retro-muted">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </div>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post._id} className="relative border border-retro-paper-border dark:border-retro-border hover:bg-retro-paper-surface dark:hover:bg-retro-surface transition-colors duration-150">
            <Link href={post.slug} className="absolute inset-0 z-[1]" aria-label={post.title} />
            <div className="p-4 pointer-events-none">
              <div className="flex items-baseline justify-between gap-4 mb-1.5">
                <span className="font-bold text-sm text-retro-ink-accent dark:text-retro-accent leading-snug">
                  {post.title}
                </span>
                <time className="text-xs text-retro-ink-muted dark:text-retro-muted shrink-0">
                  {new Date(post.date).toLocaleDateString()}
                </time>
              </div>
              {post.description && (
                <p className="text-xs text-retro-ink-muted dark:text-retro-muted leading-relaxed mb-2">
                  {post.description}
                </p>
              )}
              {post.tags && (
                <div className="relative z-[2] pointer-events-auto">
                  <TagList tags={post.tags} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="pt-2">
        <Link href="/" className="text-xs text-retro-ink-muted dark:text-retro-muted hover:text-retro-ink-accent dark:hover:text-retro-accent transition-colors duration-150">
          ← back
        </Link>
      </div>
    </div>
  )
}
