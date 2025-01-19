// app/tags/[...tag]/page.tsx
import { allPosts } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TagList } from '@/components/TagList'

interface TagPageProps {
  params: {
    tag: string[]
  }
}

export async function generateStaticParams(): Promise<TagPageProps["params"][]> {
  const tags = new Set(allPosts.flatMap(post => 
    post.tags?.split(',').map(tag => tag.trim()) ?? []
  ))
  
  return Array.from(tags).map((tag) => ({
    tag: [tag] // Return tag as an array
  }))
}

export default function TagPage({ params }: TagPageProps) {
  const tag = params.tag[0] // Get the first (and only) tag segment
  
  const posts = allPosts
    .filter(post => post.tags?.split(',').map(t => t.trim()).includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Posts tagged with &ldquo;{tag}&rdquo;</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post._id} className="border-b border-gray-200 pb-6">
            <Link href={post.slug} className="no-underline">
              <h2 className="text-2xl font-semibold hover:text-purple-600 transition-colors">
                {post.title}
              </h2>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{post.description}</p>
            {post.tags && (
              <div className="mt-4">
                <TagList tags={post.tags} />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
