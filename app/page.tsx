import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"
import { TagList } from "@/components/TagList"

export default function Home() {
  allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  
  return (
    <ul className="space-y-6">
      {allPosts.map((post) => (
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
