import { notFound } from "next/navigation"
import { Metadata } from "next"
import { allPages } from "contentlayer/generated"

import { Mdx } from "@/components/mdx-components"
import { processMdx } from "@/lib/mdx-utils"

// Define the params type for Next.js 15
type PageParams = Promise<{ slug: string[] }>

// Function to get the page from params
async function getPageFromParams(params: Awaited<PageParams>) {
  const slug = params?.slug?.join("/")
  const page = allPages.find((page) => page.slugAsParams === slug)

  if (!page) {
    return null
  }

  return page
}

// Generate metadata for the page
export async function generateMetadata(props: {
  params: PageParams
}): Promise<Metadata> {
  const params = await props.params
  const page = await getPageFromParams(params)

  if (!page) {
    return {}
  }

  return {
    title: page.title,
    description: page.description,
  }
}

// Generate static params for all pages
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return allPages.map((page) => ({
    slug: page.slugAsParams.split("/"),
  }))
}

// Page component
export default async function PagePage(props: {
  params: PageParams
}) {
  const params = await props.params
  const page = await getPageFromParams(params)

  if (!page) {
    notFound()
  }
  
  // Process the MDX content
  const mdxSource = await processMdx(page.body.raw)

  return (
    <div className="space-y-8">
      <div className="glow-card relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_70%_30%,rgba(0,0,0,0.8),transparent_70%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.22),transparent_35%),radial-gradient(circle_at_45%_90%,rgba(16,185,129,0.2),transparent_35%)]" />
        </div>
        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">Article</p>
          <h1 className="font-display text-3xl leading-tight text-slate-900 dark:text-white">
            {page.title}
          </h1>
          {page.description && <p className="text-slate-700 dark:text-slate-300">{page.description}</p>}
        </div>
      </div>
      <article className="glow-card prose prose-slate max-w-none dark:prose-invert">
        <Mdx code={mdxSource} />
      </article>
    </div>
  )
}
