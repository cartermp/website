import { Components } from "react-markdown";
import { Code } from "bright"
import { useMDXComponent } from "next-contentlayer/hooks"

const CODE_THEME_CONFIG = {
  dark: "github-dark",
  light: "github-light",
  lightSelector: 'html[class="light"]',
} as const;

Code.theme = CODE_THEME_CONFIG;

const MARKDOWN_COMPONENTS: Components = {
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");

    if (match) {
      return (
        <Code
          lang={match[1]}
          {...props}
          className="mt-6 rounded-lg border border-purple-200 dark:border-purple-800
                             hover:border-purple-300 dark:hover:border-purple-700
                             transition-colors duration-200"
        >
          {String(children).replace(/\n$/, "")}
        </Code>
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
  h1: ({ children }) => (
    <h1 className="mt-8 mb-4 text-2xl font-bold text-purple-700 dark:text-purple-300">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-4 text-2xl font-semibold text-purple-700 dark:text-purple-300">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-4 text-2xl font-semibold text-purple-700 dark:text-purple-300">
      {children}
    </h3>
  ),
}

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code)

  return <Component components={MARKDOWN_COMPONENTS} />
}