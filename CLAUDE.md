# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ IMPORTANT: Documentation-First Approach

**ALWAYS refer to the relevant documentation files in the `/docs` directory BEFORE generating any code.**

Before writing or modifying code for any feature or technology used in this project:
1. Check if a relevant documentation file exists in `/docs`
2. Read and understand the patterns, examples, and guidelines documented there
3. Follow the documented conventions and code patterns exactly
4. Only then proceed with code generation

This ensures consistency with project standards and prevents using outdated patterns.

### Available Documentation

- `/docs/auth.md` - Authentication standards (Clerk)
- `/docs/data-fetching.md` - Data fetching patterns
- `/docs/data-mutations.md` - Data mutation patterns (Server Actions, Zod validation)
- `/docs/server-components.md` - Server Components standards (async params, searchParams)
- `/docs/routing.md` - Routing standards (protected routes, middleware)
- `/docs/ui.md` - UI component standards (shadcn/ui)

## Project Overview

This is a Next.js 16 application for a lifting diary course, built with:
- **Next.js 16.1.1** with App Router (not Pages Router)
- **React 19.2.3**
- **TypeScript 5**
- **Tailwind CSS v4** (using the new `@tailwindcss/postcss` plugin)
- **Clerk** for authentication and user management

## Development Commands

### Running the Development Server
```bash
npm run dev
```
The app runs on http://localhost:3000 by default. Pages auto-reload on file changes.

### Building for Production
```bash
npm run build
```
Creates an optimized production build in `.next/` directory.

### Running Production Server
```bash
npm run start
```
Runs the production build locally (must run `npm run build` first).

### Linting
```bash
npm run lint
```
Runs ESLint across the codebase.

## Architecture

### App Router Structure
This project uses Next.js App Router (not Pages Router). The routing structure is:
- `app/layout.tsx` - Root layout with global metadata, font setup (Geist Sans, Geist Mono), and HTML structure
- `app/page.tsx` - Homepage component
- `app/globals.css` - Global styles with Tailwind CSS v4 import and CSS variables for theming

### Styling System
**Tailwind CSS v4** is configured with:
- New `@import "tailwindcss"` syntax in `globals.css`
- `@theme inline` directive for custom CSS variables
- CSS custom properties for theming: `--background`, `--foreground`, font variables
- Automatic dark mode via `prefers-color-scheme`
- Font families: Geist Sans (variable: `--font-geist-sans`) and Geist Mono (variable: `--font-geist-mono`) loaded via `next/font/google`

### TypeScript Configuration
- Path alias `@/*` maps to project root (e.g., `@/app/...`)
- Strict mode enabled
- JSX transform: `react-jsx` (React 19 automatic JSX runtime)
- Target: ES2017

### Authentication (Clerk)
**IMPORTANT:** This project uses Clerk with Next.js App Router. Follow these patterns:

#### File Structure
- `proxy.ts` - Middleware file using `clerkMiddleware()` (Next.js 16+ uses `proxy.ts`, not `middleware.ts`)
- `.env.local` - Contains Clerk API keys (excluded from git via `.gitignore`)
- `app/layout.tsx` - Wrapped with `<ClerkProvider>`, includes auth UI in header

#### Clerk Imports
- **Server-side**: Import from `@clerk/nextjs/server` (e.g., `clerkMiddleware`, `auth()`, `currentUser()`)
- **Client-side components**: Import from `@clerk/nextjs` (e.g., `SignInButton`, `UserButton`, `SignedIn`, `SignedOut`)
- **Always use async/await** with server functions like `auth()` and `currentUser()`

#### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```
Get these from: https://dashboard.clerk.com/last-active?path=api-keys

#### Route Protection
By default, `clerkMiddleware()` does NOT protect routes. To protect routes, use `createRouteMatcher`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

#### Common Patterns
- Use `<SignedIn>` and `<SignedOut>` components to conditionally render UI
- Use `auth()` in Server Components or Server Actions to get user ID
- Use `currentUser()` to get full user object
- Use `<UserButton />` for user menu with sign-out

## Key Conventions

### Component Creation
- Server Components by default (no `"use client"` needed)
- Add `"use client"` directive only when using React hooks, event handlers, or browser APIs
- Use TypeScript for all components (`.tsx` extension)

### Imports
- Use `@/` path alias for imports from project root
- Next.js components: Import from `next/[feature]` (e.g., `next/image`, `next/font/google`)

### Metadata
- Use `export const metadata: Metadata = {...}` in Server Components
- For dynamic metadata, use `generateMetadata()` function

## Project-Specific Notes

- Clerk authentication is fully integrated with sign-in/sign-up modals in the header
- The project uses Tailwind CSS v4 which has breaking changes from v3 (no `tailwind.config.js`, new CSS-first configuration)
- Environment variables must be configured in `.env.local` before running the app (see Authentication section)
