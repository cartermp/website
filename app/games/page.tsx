import Link from "next/link"

const games = [
  {
    title: "Shape Circuit",
    description: "A Tango-inspired shape logic puzzle with balanced rows and columns.",
    href: "/games/shape-puzzle",
    detail: "Medium difficulty · 4×4 grid",
  },
]

export const metadata = {
  title: "Games",
  description: "Playable mini-games and puzzles.",
}

export default function GamesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Games</p>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50">Playable puzzles</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            Short-form experiments built around visuals and mechanics. Pick a game to play directly in the browser.
          </p>
        </div>
      </header>

      <ul className="grid gap-5">
        {games.map((game) => (
          <li key={game.title} className="group relative">
            <Link
              href={game.href}
              className="block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80
                         bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition
                         hover:-translate-y-1 hover:shadow-[0_30px_120px_rgba(15,23,42,0.25)]
                         duration-300"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-sky-400 to-purple-500" />
              <div className="relative grid gap-4 p-6 lg:p-8">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span className="rounded-full border border-slate-200/80 dark:border-slate-800/70 px-3 py-1 bg-white/70 dark:bg-slate-900/70">
                      {game.detail}
                    </span>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{game.title}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                      {game.description}
                    </p>
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
