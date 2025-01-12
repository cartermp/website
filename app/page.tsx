import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"

export default function Home() {
  return (
    <div className="prose dark:prose-invert">
      {allPosts.map((post) => (
        <article key={post._id}>
          <Link 
            href={post.slug}
            className="no-underline"
          >
            <h2 className="text-gray-600 dark:text-gray-400
                           hover:text-purple-700 dark:hover:text-purple-300
                           transition-colors duration-200">
              {post.title}
            </h2>
          </Link>
          {post.description && <p>{post.description}</p>}
        </article>
      ))}
    </div>
  )
}