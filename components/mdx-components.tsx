import { Components } from "react-markdown";
import { Code } from "bright"
import { useMDXComponent } from "next-contentlayer/hooks"
import { Suspense } from "react";

const LinkableHeading = ({ level, children, className }: {
  level: 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  children: React.ReactNode,
  className?: string
}) => {
  const slug = typeof children === 'string'
    ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : '';

  const Tag = level;

  return (
    <Tag
      id={slug}
      className="mt-8 mb-4 text-2xl font-semibold text-purple-700 dark:text-purple-300 group"
    >
      <a href={`#${slug}`} className="no-underline text-inherit">
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          #
        </span>
      </a>
    </Tag>
  );
};

const CODE_THEME_CONFIG = {
  dark: "github-dark",
  light: "github-light",
  lightSelector: 'html[class="light"]',
} as const;

Code.theme = CODE_THEME_CONFIG;

type CodeProps = {
  lang: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
};

async function BrightCode(props: CodeProps) {
  const rendered = await Code({
    lang: props.lang,
    children: String(props.children).replace(/\n$/, ""),
    className: props.className
  });

  
  return rendered;
}

const MARKDOWN_COMPONENTS: Components = {
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");

    if (match) {
      return (
        <Suspense fallback={<div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />}>
          {/* @ts-expect-error - Known issue with async components */}
          <BrightCode
            lang={match[1]}
            {...props}
            className="mt-6 rounded-lg border border-purple-200 dark:border-purple-800
                             hover:border-purple-300 dark:hover:border-purple-700
                             transition-colors duration-200"
          >
            {children}
          </BrightCode>
        </Suspense>
      );
    }

    return (
      <code
        className="bg-purple-50 dark:bg-purple-900/20
                       hover:bg-purple-100 dark:hover:bg-purple-900/30
                       px-1.5 py-0.5 rounded text-purple-700 dark:text-purple-300
                       transition-colors duration-200"
        {...props}
      >
        {children}
      </code>
    );
  },
  p: ({ children, ...props }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props}>
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h1 className="mt-8 mb-4 text-2xl font-bold text-purple-700 dark:text-purple-300">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <LinkableHeading level="h2">
      {children}
    </LinkableHeading>
  ),
  h3: ({ children }) => (
    <LinkableHeading level="h3">
      {children}
    </LinkableHeading>
  ),
  h4: ({ children }) => (
    <LinkableHeading level="h4">
      {children}
    </LinkableHeading>
  ),
  h5: ({ children }) => (
    <LinkableHeading level="h5">
      {children}
    </LinkableHeading>
  ),
  h6: ({ children }) => (
    <LinkableHeading level="h6">
      {children}
    </LinkableHeading>
  ),
  section: ({ children, className }) => {
    if (className === "footnotes") {
      return (
        <section className="prose dark:prose-invert mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="mb-4">Footnotes</h2>
          {children}
        </section>
      );
    }
    return <section>{children}</section>;
  },
}

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code)

  return <Component components={MARKDOWN_COMPONENTS} />
}