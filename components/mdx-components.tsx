'use client';

import React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

// Define MDX components
const components = {
  p: ({ children, ...props }: any) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props}>
      {children}
    </p>
  ),
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
      <div className="mdx-content">
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
