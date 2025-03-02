import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import { createElement, ReactNode } from 'react';
import { serialize } from 'next-mdx-remote/serialize';

// Process MDX content to serialized format for next-mdx-remote
export async function processMdx(content: string) {
  try {
    // Extract the content part (remove frontmatter if needed)
    const mdxContent = content.replace(/^---[\s\S]*?---/, '').trim();
    
    // Serialize the MDX content for use with MDXRemote
    const mdxSource = await serialize(mdxContent, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        development: process.env.NODE_ENV === 'development',
      },
    });
    
    return mdxSource;
  } catch (error) {
    console.error('Error processing MDX:', error);
    throw error;
  }
}
