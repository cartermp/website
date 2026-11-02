# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm run preview` - Build and start production server locally
- `npm run lint` - Run Next.js linting

## Architecture Overview

This is a Next.js 15 personal website with an MDX blog and a browser-based shape puzzle game:

### Blog System
- Uses **Contentlayer** for MDX content management
- Blog posts located in `content/posts/` as `.mdx` files
- Pages (like About) in `content/pages/` as `.mdx` files
- Post schema: `title`, `description`, `date`, `tags` (optional)
- Auto-generated slugs and computed fields via `contentlayer.config.js`

### Key Technical Details

- **Styling**: Tailwind CSS with custom theme (purple accent colors)
- **Dark Mode**: Built-in theme switching via `next-themes`
- **Path Aliases**: `@/*` maps to root directory
- **TypeScript**: Strict mode enabled

### Project Structure Patterns

- Components are co-located with their pages when specific to that feature
- Shared utilities in `/lib/` directory
- MDX content processed through Contentlayer for type safety
