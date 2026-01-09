# VeloCMS - Agent Guide

This document helps AI agents work effectively in the VeloCMS codebase.

## Project Overview

VeloCMS is a multi-theme blog/CMS system built with Next.js 15, featuring:
- Custom template language (VT) for theme development
- Multi-database support (Vercel Postgres + SQLite)
- Video integration for content creators
- Type-safe architecture with TypeScript

## Essential Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
```

### Database
```bash
npm run db:generate      # Generate database migrations
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio
```

### Testing
```bash
npm test                # Run tests
npm run test:coverage   # Run tests with coverage
```

## Code Organization

### Core Structure
```
velocms/
├── src/                      # Next.js app (App Router)
│   ├── app/                 # Route handlers and pages
│   ├── components/          # React components
│   └── lib/                 # Utility functions
│
├── packages/                 # Shared packages
│   ├── db/                  # Database abstraction
│   │   ├── drizzle/         # Schema and migrations
│   │   ├── adapter/         # DB adapters (Vercel, SQLite)
│   │   └── repositories/     # Data access layer
│   │
│   ├── core/                # Business logic
│   ├── template-lang/       # Template language implementation
│   └── theme-system/        # Theme system
│
└── themes/                   # Theme files
    └── default/             # Default theme
```

### Key Files

- **Database Schema**: `packages/db/drizzle/schema/*.ts`
- **Database Client**: `packages/db/client.ts`
- **Next.js Config**: `next.config.js`
- **TypeScript Config**: `tsconfig.json`
- **Drizzle Config**: `drizzle.config.ts`

## Code Patterns

### Database Access

Always use the repository pattern:

```typescript
import { postRepository } from '@/db/repositories/post.repository'

// Get post by ID
const post = await postRepository.findById(id)

// Find posts with filters
const posts = await postRepository.findMany({ status: 'published' })

// Create post
const newPost = await postRepository.create({
  userId: 1,
  title: 'Hello World',
  slug: 'hello-world',
  content: '...',
  status: 'published'
})
```

### Server Actions

Use Server Actions for mutations:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { postRepository } from '@/db/repositories/post.repository'

export async function createPost(data: CreatePostDto) {
  const post = await postRepository.create(data)
  revalidatePath('/')
  return post
}
```

### Path Aliases

Use these imports:
- `@/` → `src/`
- `@/db/*` → `packages/db/*`
- `@/core/*` → `packages/core/*`
- `@/template-lang/*` → `packages/template-lang/*`
- `@/theme-system/*` → `packages/theme-system/*`

## Environment Variables

### Development
```bash
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/velocms.db
AUTH_SECRET=development-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (Vercel)
```bash
DATABASE_TYPE=vercel
DATABASE_URL=postgresql://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
AUTH_SECRET=production-secret
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Technology Stack

### Core Framework
- **Next.js 15**: App Router with Server Components
- **React 19**: UI library
- **TypeScript 5.4**: Type safety

### Database
- **Drizzle ORM**: Type-safe database access
- **Vercel Postgres**: Production database
- **SQLite**: Development database
- **Vercel KV**: Cache layer

### UI & Styling
- **Tailwind CSS**: Utility-first CSS
- **next-themes**: Dark mode support
- **Lucide React**: Icons

### Content
- **react-markdown**: Markdown rendering
- **Shiki**: Code highlighting
- **date-fns**: Date formatting

### Validation
- **Zod**: Schema validation

## Testing Strategy

- Unit tests for repositories and services
- Integration tests for API routes
- E2E tests for critical user flows

## Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Local Deployment
```bash
npm run build
npm start
```

## Naming Conventions

### Files
- Components: PascalCase (`PostCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`User.ts`)
- Database tables: snake_case (`posts`, `user_settings`)

### Database
- Tables: plural (`users`, `posts`)
- Columns: snake_case (`created_at`, `user_id`)
- Repository classes: PascalCase (`PostRepository`)

### Code
- Functions: camelCase (`createPost`, `findById`)
- Variables: camelCase (`post`, `userId`)
- Constants: UPPER_SNAKE_CASE (`MAX_POSTS_PER_PAGE`)

## Important Gotchas

1. **Database Types**: Always import types from schema files
   ```typescript
   import type { Post, NewPost } from '@/db/drizzle/schema'
   ```

2. **Server vs Client Components**: Default to Server Components, only use Client Components for interactivity

3. **Database Connection**: Never manually manage connections; use `db.getAdapter()`

4. **Environment Variables**: Never commit `.env` file; use `.env.example` as template

5. **Template Files**: Theme templates use `.vt` extension

6. **Type Safety**: Always use TypeScript types, avoid `any`

7. **Code Splitting**: Next.js automatically code splits; avoid dynamic imports unless necessary

## Common Tasks

### Adding a New Database Table

1. Create schema in `packages/db/drizzle/schema/`
2. Export from `packages/db/drizzle/schema/index.ts`
3. Run `npm run db:generate` to create migration
4. Create repository in `packages/db/repositories/`
5. Export from `packages/db/repositories/index.ts`

### Creating a New API Route

```typescript
// src/app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { postRepository } from '@/db/repositories/post.repository'

export async function GET() {
  const posts = await postRepository.findPublished()
  return NextResponse.json(posts)
}
```

### Adding a New Theme

1. Create directory in `themes/your-theme/`
2. Create `theme.config.json`
3. Create template files in `templates/`
4. Register theme in theme registry

## Performance Considerations

1. Use Server Components by default
2. Cache database queries when appropriate
3. Use `revalidatePath()` for cache invalidation
4. Optimize images with `next/image`
5. Use dynamic imports for large libraries

## Security Best Practices

1. Never expose sensitive data in client components
2. Validate all user input with Zod
3. Use Server Actions for mutations
4. Implement proper authentication checks
5. Sanitize all user-generated content
6. Use parameterized queries (Drizzle handles this)

## Development Workflow

### Documentation Guidelines

**Rule**: Only write summary documentation for complete major features. Do not write summary documents for:

- ❌ Small feature additions
- ❌ Bug fixes
- ❌ Minor tweaks
- ❌ Configuration changes
- ❌ Dependency updates

**When to write documentation**:

Write comprehensive documentation (like `FEATURE_NAME.md`) only for:

- ✅ Complete major features
- ✅ Significant architectural changes
- ✅ New systems or modules
- ✅ Complex integrations

**Examples**:

| Task | Write Doc? | Notes |
|------|------------|-------|
| Fix SSR error | ❌ No | Simple bug fix |
| Change font size | ❌ No | Minor tweak |
| Add Markdown editor | ✅ Yes | Complete major feature |
| Update blog homepage | ✅ Yes | Complete feature update |

For minor tasks, just use commit messages and inline code comments.

## Memory Files

Check these files for project-specific commands and patterns:
- `AGENTS.md` (this file) - Agent guide and development workflow
- `README.md` - Project overview and setup instructions
- `QUICK_START.md` - Quick navigation guide for all pages
- `COMPLETE_PAGES.md` - Complete list of all pages and features

## Getting Help

- Review architecture docs in `docs/`
- Check existing code for patterns
- Use TypeScript to guide implementation
- Follow established conventions in similar files
