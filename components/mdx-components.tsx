import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { withBasePath } from '@/lib/site';

// Define interface for image props
interface ImgProps {
  src: string;
  alt?: string;
  [key: string]: any;
}

// Define MDX components
const components = {
  p: ({ children, ...props }: any) => {
    // Check if the only child is an img element
    const hasOnlyImgChild = 
      React.Children.count(children) === 1 && 
      React.isValidElement(children) && 
      children.type === 'img';
    
    // If it's just an image, don't wrap it in a <p>
    if (hasOnlyImgChild) {
      const imgChild = children as React.ReactElement;
      const imgProps = imgChild.props as ImgProps;
      const { src, alt, ...restImgProps } = imgProps;
      const imageSrc = /^(https?:|data:|\/\/)/.test(src) ? src : withBasePath(src.startsWith('/') ? src : `/${src}`);
      
      return (
        <div className="my-6 overflow-hidden rounded-lg max-w-full">
          <Image
            src={imageSrc}
            alt={alt || ""}
            width={800}
            height={500}
            sizes="(max-width: 768px) 100vw, 800px"
            className="w-full h-auto max-w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
            {...restImgProps}
          />
        </div>
      );
    }
    
    // Otherwise, render as normal paragraph
    return (
      <p className="leading-7 [&:not(:first-child)]:mt-6" {...props}>
        {children}
      </p>
    );
  },
  h1: ({ children }: any) => (
    <h1 className="mt-8 mb-4 text-2xl font-bold text-retro-ink-accent dark:text-retro-accent">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mt-8 mb-4 text-xl font-bold text-retro-ink-accent dark:text-retro-accent group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="mt-8 mb-4 text-lg font-bold text-retro-ink-accent dark:text-retro-accent group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="mt-8 mb-4 text-base font-bold text-retro-ink-accent dark:text-retro-accent group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="mt-8 mb-4 text-sm font-bold text-retro-ink-accent dark:text-retro-accent group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="mt-8 mb-4 text-xs font-bold text-retro-ink-accent dark:text-retro-accent group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h6>
  ),
  a: ({ children, ...props }: any) => (
    <a
      className="font-medium text-retro-ink-accent dark:text-retro-accent underline underline-offset-4 hover:text-retro-ink dark:hover:text-retro-text"
      {...props}
      href={withBasePath(props.href || "")}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }: ImgProps) => {
    // Handle both absolute and relative paths
    const imageSrc = /^(https?:|data:|\/\/)/.test(src) ? src : withBasePath(src.startsWith('/') ? src : `/${src}`);
    return (
      <Image
        src={imageSrc}
        alt={alt || ""}
        width={800}
        height={500}
        sizes="(max-width: 768px) 100vw, 800px"
        className="w-full h-auto max-w-full my-6 rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
        {...props}
      />
    );
  },
  video: ({ children, ...props }: any) => (
    <video className="w-full h-auto max-w-full my-6 rounded-lg" controls {...props}>
      {children}
    </video>
  ),
  iframe: ({ ...props }: any) => (
    <div className="my-6 w-full max-w-full overflow-hidden rounded-lg">
      <iframe className="w-full max-w-full aspect-video" {...props} />
    </div>
  ),
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <pre className="p-4 bg-retro-paper-surface dark:bg-retro-surface border border-retro-paper-border dark:border-retro-border overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code
        className="px-1.5 py-0.5 border border-retro-paper-border dark:border-retro-border bg-retro-paper-surface dark:bg-retro-surface text-retro-ink dark:text-retro-text font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export function Mdx({ source }: { source: string }) {
  return (
    <div className="mdx-content min-w-0 break-words">
      <MDXRemote source={source} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </div>
  );
}
