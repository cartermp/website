import { notFound } from "next/navigation"
import { allPosts } from "@/lib/content"
import { Metadata } from "next"
import { Mdx } from "@/components/mdx-components"
import Link from "next/link"
import { TagList } from "@/components/TagList"

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
    timeZone: "UTC",
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
  
  return (
    <article className="prose reading-prose mx-auto max-w-[68ch] break-words pb-6 sm:prose-lg">
      {post.standardUri && (
        <link rel="site.standard.document" href={post.standardUri} />
      )}
      <h1 className="mb-4 font-display text-ink">{post.title}</h1>
      {post.description && (
        <p className="mt-0 text-lg text-muted sm:text-xl">
          {post.description}
        </p>
      )}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <time>{date}</time>
          <div className="hidden sm:block w-px h-4 bg-line" />
          <span>{readingTime}</span>
          <div className="hidden sm:block w-px h-4 bg-line" />
          {post.tags && <TagList tags={post.tags} />}
        </div>
      </div>
      <hr className="my-4 border-line" />
      <Mdx source={post.body.raw} />

      <footer className="mt-8 pt-4 border-t border-line">
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
            className="text-base text-muted
                     hover:text-accent
                     transition-colors"
          >
            ← Home
          </Link>
          <time className="text-base text-muted">
            {date}
          </time>
        </div>
      </footer>
    </article>
  )
}
