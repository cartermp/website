# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm run preview` - Build and start production server locally
- `npm run lint` - Run Next.js linting
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

This is a Next.js 15 personal website with two main sections:

### Blog System
- Uses **Contentlayer** for MDX content management
- Blog posts located in `content/posts/` as `.mdx` files
- Pages (like About) in `content/pages/` as `.mdx` files
- Post schema: `title`, `description`, `date`, `tags` (optional)
- Auto-generated slugs and computed fields via `contentlayer.config.js`

### CalTrack Application
A calorie tracking feature with full CRUD operations:
- **Database**: Neon Postgres via `@neondatabase/serverless`
- **Location**: `/app/caltrack/` directory
- **API Routes**: `/app/api/caltrack/` with endpoints for add, delete, foods, migrate
- **Components**: Reusable UI components in `/app/caltrack/components/`
- **Features**: Food autocomplete, trend charts (Recharts), stats, sharing capabilities
- **Testing**: Comprehensive Jest tests for components and API helpers

### Key Technical Details

- **Database**: Neon serverless Postgres accessed via `lib/db.ts`
- **Styling**: Tailwind CSS with custom theme (purple accent colors)
- **Dark Mode**: Built-in theme switching via `next-themes`
- **Testing**: Jest with React Testing Library, configured for Next.js
- **Path Aliases**: `@/*` maps to root directory
- **TypeScript**: Strict mode enabled

### Project Structure Patterns

- API routes follow REST conventions (`/api/caltrack/[resource]`)
- Components are co-located with their pages when specific to that feature
- Shared utilities in `/lib/` directory
- Test files use `__tests__` directories with `.test.[jt]sx?` pattern
- MDX content processed through Contentlayer for type safety

### Database Schema (CalTrack)
The calorie tracking system uses these key fields:
- Date-based entries with calories, food names, and timestamps
- Migration endpoint available for schema updates

### Authenticated API (CalTrack)
A comprehensive REST API is available at `/api/v1/caltrack/` with these endpoints:

**Authentication**: Requires either:
- API key header: `x-api-key: YOUR_API_KEY`
- Session authentication (NextAuth)

**Export Endpoints**:
- `GET /export/entries` - Export individual entries with filtering
- `GET /export/daily-stats` - Export aggregated daily statistics
- `GET /export/summary` - Export comprehensive summary with insights

**Analytics Endpoints**:
- `GET /analytics/trends` - Calorie trends with moving averages
- `GET /analytics/patterns` - Eating patterns (day-of-week, consistency)
- `GET /analytics/foods` - Food consumption analysis

All endpoints support JSON and CSV output formats via `?format=csv` parameter.
See `API_DOCUMENTATION.md` for detailed usage examples.