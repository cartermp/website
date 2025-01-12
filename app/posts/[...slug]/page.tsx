import { notFound } from "next/navigation"
import { allPosts } from "contentlayer/generated"

import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import Link from "next/link"

interface PostProps {
  params: {
    slug: string[]
  }
}

function getReadingTime(text: string): string {
  const WORDS_PER_MINUTE = 225;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return `${minutes} min read`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

async function getPostFromParams(params: PostProps["params"]) {
  const slug = params?.slug?.join("/")
  const post = allPosts.find((post) => post.slugAsParams === slug)

  if (!post) {
    null
  }

  return post
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const post = await getPostFromParams(params)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description,
  }
}

export async function generateStaticParams(): Promise<PostProps["params"][]> {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage({ params }: PostProps) {
  const post = await getPostFromParams(params)

  if (!post) {
    notFound()
  }

  const date = formatDate(post.date)
  const readingTime = getReadingTime(post.body.code)

  return (
    <article className="prose dark:prose-invert max-w-none py-6">
      <h1 className="mb-2">{post.title}</h1>
      {post.description && (
        <p className="text-xl mt-0 text-slate-700 dark:text-slate-200">
          {post.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
        <time>{date}</time>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <span>{readingTime}</span>
      </div>
      <hr className="my-4" />
      <Mdx code={post.body.code} />

      <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-base text-gray-600 dark:text-gray-400
                     hover:text-purple-700 dark:hover:text-purple-300
                     transition-colors"
          >
            ← Home
          </Link>
          <time className="text-base text-gray-500 dark:text-gray-400">
            {new Date(post.date).toLocaleDateString()}
          </time>
        </div>
      </footer>
    </article>
  )
}
