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
    <article className="py-6 prose prose-sm sm:prose-base dark:prose-invert break-words">
      <h1 className="mb-2 text-purple-700 dark:text-purple-300">{page.title}</h1>
      {page.description && <p className="text-xl">{page.description}</p>}
      <Mdx code={mdxSource} />
    </article>
  )
}
