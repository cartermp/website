import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"
import { TagList } from "@/components/TagList"

export default function Home() {
  const posts = [...allPosts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  if (posts.length === 0) {
    return (
      <div className="glow-card">
        <h2 className="font-display text-2xl text-slate-900 dark:text-white">No posts yet</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-300">Check back soon—new signals are on the way.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/70 via-white/50 to-white/25 p-8 shadow-[0_28px_120px_-60px_rgba(0,0,0,0.7)] backdrop-blur-2xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/0 lg:p-12">
        <div className="absolute inset-0 opacity-80 [mask-image:radial-gradient(circle_at_40%_45%,rgba(0,0,0,0.65),transparent_70%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.3),transparent_35%),radial-gradient(circle_at_85%_18%,rgba(236,72,153,0.32),transparent_40%),radial-gradient(circle_at_35%_85%,rgba(16,185,129,0.2),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.6),rgba(255,255,255,0)),linear-gradient(60deg,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
        </div>
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.25)]" />
              New Signals
            </div>
            <h2 className="font-display text-4xl leading-tight text-slate-900 drop-shadow-sm dark:text-white lg:text-5xl">
              A kinetic lab notebook for engineering, writing, and lived experiments.
            </h2>
            <p className="text-lg text-slate-700 dark:text-slate-200">
              Unexpected pairings, systems thinking, and unabashed craft. Everything here is stitched with intent—designed to feel like a one-off instrument panel rather than a template.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="chip-ghost">Latency + lore</span>
              <span className="chip-ghost">Calm velocity</span>
              <span className="chip-ghost">Opinionated defaults</span>
              <span className="chip-ghost">Curated chaos</span>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="glow-card border-dashed border-white/50 bg-white/60 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">Latest drop</p>
              <div className="mt-3 space-y-2">
                <Link href={posts[0].slug} className="font-display text-2xl leading-tight text-slate-900 transition hover:text-purple-600 dark:text-white dark:hover:text-purple-200">
                  {posts[0].title}
                </Link>
                <p className="text-sm text-slate-700 dark:text-slate-300">{posts[0].description}</p>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-emerald-400/30 px-2 py-1 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-200">
                    Fresh
                  </span>
                  <span className="uppercase tracking-[0.25em]">
                    {new Date(posts[0].date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["LLMs", "DevEx", "Systems", "People"].map((item) => (
                <div key={item} className="relative overflow-hidden rounded-xl border border-white/30 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm shadow-black/5 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-purple-400/60 hover:shadow-purple-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-purple-400/60">
                  <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_30%_30%,rgba(0,0,0,0.8),transparent_70%)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(99,102,241,0.18),transparent_40%),radial-gradient(circle_at_75%_25%,rgba(236,72,153,0.2),transparent_35%)]" />
                  </div>
                  <span className="relative z-10">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Dispatches</p>
            <h3 className="font-display text-3xl text-slate-900 dark:text-white">Articles with a pulse</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="rounded-full bg-purple-500/20 px-3 py-1 font-semibold uppercase tracking-[0.22em] text-purple-900 dark:bg-purple-500/15 dark:text-purple-100">Swipe + explore</span>
            <span className="hidden h-4 w-px bg-slate-300/70 dark:bg-white/10 md:block" />
            <span className="hidden md:block">
              {posts.length} entries connected by gradients, timelines, and intent.
            </span>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((post, index) => (
            <article key={post._id} className="group glow-card">
              <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_50%_20%,rgba(0,0,0,0.8),transparent_70%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(236,72,153,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_40%)]" />
              </div>
              <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-gradient-to-br from-purple-500/20 to-blue-500/20 font-mono text-xs font-bold text-slate-900 shadow-sm shadow-purple-500/20 dark:border-white/10 dark:text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-2">
                      <Link href={post.slug} className="font-display text-xl leading-tight text-slate-900 transition hover:text-purple-600 dark:text-white dark:hover:text-purple-200">
                        {post.title}
                      </Link>
                      {post.description && (
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {post.description}
                        </p>
                      )}
                    </div>
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
      </section>
    </div>
  )
}
