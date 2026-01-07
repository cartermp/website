import Link from 'next/link';

export function TagList({ tags }: { tags: string }) {
  if (!tags) return null;
  
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.split(',').map(tag => tag.trim()).map(tag => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="text-xs px-3 py-1 rounded-full border border-slate-300/80 dark:border-slate-700/80
                     bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200
                     tracking-[0.1em] uppercase hover:border-sky-400 dark:hover:border-sky-500
                     transition-colors"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
