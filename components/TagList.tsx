import Link from 'next/link';

export function TagList({ tags }: { tags: string }) {
  if (!tags) return null;
  
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.split(',').map(tag => tag.trim()).map(tag => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="text-xs px-2 py-0.5 border border-retro-paper-border dark:border-retro-border
                     text-retro-ink-muted dark:text-retro-muted uppercase tracking-wide
                     hover:border-retro-ink-accent dark:hover:border-retro-accent
                     hover:text-retro-ink-accent dark:hover:text-retro-accent
                     transition-colors duration-150"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
