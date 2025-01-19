'use client';

import Link from 'next/link';

export function TagList({ tags }: { tags: string }) {
  if (!tags) return null;
  
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.split(',').map(tag => tag.trim()).map(tag => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 
                     text-purple-700 dark:text-purple-300 rounded-full 
                     hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
