import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"

export default function Home() {
  // sort posts by date
  allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
  return (
    <ul className="space-y-4">
      {allPosts.map((post) => (
        <li key={post._id} className="group">
          <Link href={post.slug} className="block -mx-2 p-2 rounded">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-purple-700 dark:text-purple-300">❯</span>
              <span className="flex-1 font-medium text-base text-gray-600 dark:text-gray-400
                              hover:text-purple-700 dark:hover:text-purple-300 
                              transition-colors">
                {post.title}
              </span>
              <time className="text-base text-gray-500 dark:text-gray-400">
                {new Date(post.date).toLocaleDateString()}
              </time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}