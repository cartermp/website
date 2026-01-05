import Link from 'next/link';

export function TagList({ tags }: { tags: string }) {
  if (!tags) return null;
  
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.split(',').map(tag => tag.trim()).map(tag => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-800 shadow-sm shadow-black/5 transition duration-200 hover:-translate-y-0.5 hover:border-purple-400/60 hover:text-purple-700 hover:shadow-purple-500/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-purple-400/60 dark:hover:text-purple-100"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
