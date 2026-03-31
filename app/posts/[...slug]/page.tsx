import { notFound } from "next/navigation"
import { allPosts } from "contentlayer/generated"
import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import Link from "next/link"
import { TagList } from "@/components/TagList"
import { processMdx } from "@/lib/mdx-utils"

// Define the params type for Next.js 15
type PostParams = Promise<{ slug: string[] }>

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
}

async function getPostFromParams(params: Awaited<PostParams>) {
  const slug = params?.slug?.join("/")
  const post = allPosts.find((post) => post.slugAsParams === slug)

  if (!post) {
    return null
  }

  return post
}

export async function generateMetadata(props: {
  params: PostParams
}): Promise<Metadata> {
  const params = await props.params
  const post = await getPostFromParams(params)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description,
  }
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage(props: {
  params: PostParams
}) {
  const params = await props.params
  const post = await getPostFromParams(params)

  if (!post) {
    notFound()
  }

  const date = formatDate(post.date)
  const readingTime = getReadingTime(post.body.raw)
  
  // Process the MDX content
  const mdxSource = await processMdx(post.body.raw)

  return (
    <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none pb-6 break-words">
      <h1 className="mb-2 text-retro-ink-accent dark:text-retro-accent">{post.title}</h1>
      {post.description && (
        <p className="text-xl mt-0 text-retro-ink dark:text-retro-text">
          {post.description}
        </p>
      )}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-retro-ink-muted dark:text-retro-muted">
          <time>{date}</time>
          <div className="hidden sm:block w-px h-4 bg-retro-paper-border dark:bg-retro-border" />
          <span>{readingTime}</span>
          <div className="hidden sm:block w-px h-4 bg-retro-paper-border dark:bg-retro-border" />
          {post.tags && <TagList tags={post.tags} />}
        </div>
      </div>
      <hr className="my-4 border-retro-paper-border dark:border-retro-border" />
      <Mdx code={mdxSource} />

      <footer className="mt-8 pt-4 border-t border-retro-paper-border dark:border-retro-border">
        <div className="not-prose mb-4 space-y-2">
          {post.tags && (
            <>
              <TagList tags={post.tags} />
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-base text-retro-ink-muted dark:text-retro-muted
                     hover:text-retro-ink-accent dark:hover:text-retro-accent
                     transition-colors"
          >
            ← Home
          </Link>
          <time className="text-base text-retro-ink-muted dark:text-retro-muted">
            {new Date(post.date).toLocaleDateString()}
          </time>
        </div>
      </footer>
    </article>
  )
}
