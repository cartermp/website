'use client';

import React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import Image from 'next/image';

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
      const imageSrc = src.startsWith('/') ? src : `/${src}`;
      
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
    <h1 className="mt-8 mb-4 text-2xl font-bold text-purple-700 dark:text-purple-300">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mt-8 mb-4 text-xl font-semibold text-purple-700 dark:text-purple-300 group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="mt-8 mb-4 text-lg font-semibold text-purple-700 dark:text-purple-300 group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="mt-8 mb-4 text-base font-semibold text-purple-700 dark:text-purple-300 group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="mt-8 mb-4 text-sm font-semibold text-purple-700 dark:text-purple-300 group">
      <a href={`#${typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="mt-8 mb-4 text-xs font-semibold text-purple-700 dark:text-purple-300 group">
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
      className="font-medium text-purple-600 dark:text-purple-400 underline underline-offset-4 hover:text-purple-800 dark:hover:text-purple-300"
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }: ImgProps) => {
    // Handle both absolute and relative paths
    const imageSrc = src.startsWith('/') ? src : `/${src}`;
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
      <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code
        className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
};

// Create a loading component
const LoadingComponent = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2.5"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2.5"></div>
  </div>
);

interface MdxProps {
  code: MDXRemoteSerializeResult;
}

export function Mdx({ code }: MdxProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  
  // Set isMounted to true when the component mounts (client-side only)
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Show a loading skeleton until the component is mounted
  if (!isMounted) {
    return <LoadingComponent />;
  }
  
  try {
    // Render the MDX content
    return (
      <div className="mdx-content min-w-0 break-words">
        <MDXRemote {...code} components={components} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering MDX:', error);
    return (
      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded-lg">
        <h3 className="text-red-700 dark:text-red-300 font-semibold">Error rendering content</h3>
        <p className="text-red-600 dark:text-red-400 mt-2">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
      </div>
    );
  }
}
