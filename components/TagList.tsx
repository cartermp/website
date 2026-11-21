import Link from 'next/link';

export function TagList({ tags }: { tags: string }) {
  if (!tags) return null;
  
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.split(',').map(tag => tag.trim()).map(tag => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted no-underline transition-colors hover:bg-tint hover:text-accent"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
