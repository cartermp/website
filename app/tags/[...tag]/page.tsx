import { allPosts } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
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
    <ul className="space-y-6">
      {posts.map((post) => (
        <li key={post._id} className="group">
          <div className="space-y-2">
            <Link href={post.slug} className="block -mx-2 p-2 rounded">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-purple-700 dark:text-purple-300 text-lg">❯</span>
                <span className="flex-1 font-medium text-lg text-gray-600 dark:text-gray-400
                                hover:text-purple-700 dark:hover:text-purple-300 
                                transition-colors">
                  {post.title}
                </span>
                <time className="text-lg text-gray-500 dark:text-gray-400">
                  {new Date(post.date).toLocaleDateString()}
                </time>
              </div>
            </Link>
            {post.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                {post.description}
              </p>
            )}
            {post.tags && (
              <div className="ml-6">
                <TagList tags={post.tags} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
