import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"
import { TagList } from "@/components/TagList"

export default function Home() {
  allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60">
          Log
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>
      <ul className="grid gap-5">
        {allPosts.map((post, index) => (
          <li key={post._id} className="group relative">
            <Link
              href={post.slug}
              className="block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80
                         bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition
                         hover:-translate-y-1 hover:shadow-[0_30px_120px_rgba(15,23,42,0.25)]
                         duration-300"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-sky-400 to-purple-500" />
              <div className="relative grid gap-6 md:grid-cols-[1fr_auto] p-6 lg:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span className="rounded-full border border-slate-200/80 dark:border-slate-800/70 px-3 py-1 bg-white/70 dark:bg-slate-900/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    <span>Entry</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-50">
                      {post.title}
                    </h2>
                    {post.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                        {post.description}
                      </p>
                    )}
                    {post.tags && (
                      <TagList tags={post.tags} />
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-4 text-right">
                  <time className="rounded-full border border-slate-300/80 dark:border-slate-700/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900/60">
                    {new Date(post.date).toLocaleDateString()}
                  </time>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                    <span className="text-lg text-sky-500 dark:text-sky-300 transition-transform duration-300 group-hover:translate-x-1.5">
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
