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
    <div className="space-y-10">
      <div className="glow-card relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_60%_40%,rgba(0,0,0,0.8),transparent_70%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.2),transparent_30%),radial-gradient(circle_at_40%_90%,rgba(16,185,129,0.18),transparent_35%)]" />
        </div>
        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Tag constellation</p>
          <h1 className="font-display text-3xl text-slate-900 dark:text-white">
            Posts tagged with “{tag}”
          </h1>
          <p className="text-slate-700 dark:text-slate-300">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} orbiting around this idea. Follow the thread.
          </p>
        </div>
      </div>
      <div className="grid gap-5">
        {posts.map((post, index) => (
          <article key={post._id} className="group glow-card">
            <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.8),transparent_70%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(236,72,153,0.16),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_45%)]" />
            </div>
            <div className="relative space-y-3">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-900 shadow-sm shadow-purple-500/20 dark:bg-purple-500/15 dark:text-purple-100">
                  {tag}
                </span>
                <span className="rounded-full bg-white/60 px-3 py-1 text-slate-700 shadow-sm shadow-black/5 backdrop-blur dark:bg-white/10 dark:text-slate-200">
                  #{index + 1}
                </span>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Link href={post.slug} className="font-display text-2xl leading-tight text-slate-900 transition hover:text-purple-600 dark:text-white dark:hover:text-purple-200">
                    {post.title}
                  </Link>
                  {post.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {post.description}
                    </p>
                  )}
                </div>
                <time className="rounded-full bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm shadow-black/5 backdrop-blur dark:bg-white/10 dark:text-slate-200">
                  {new Date(post.date).toLocaleDateString()}
                </time>
              </div>
              {post.tags && (
                <div className="flex items-center justify-between gap-4">
                  <TagList tags={post.tags} />
                  <Link href={post.slug} className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-purple-900 transition hover:-translate-y-0.5 hover:border-purple-400 hover:text-purple-800 dark:border-purple-400/40 dark:bg-purple-500/15 dark:text-purple-100">
                    Read
                    <span aria-hidden>↗</span>
                  </Link>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
