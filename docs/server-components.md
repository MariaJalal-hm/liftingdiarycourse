# Server Components

This document outlines coding standards for Server Components in this Next.js 16 project.

## Async Params and SearchParams

**CRITICAL:** In Next.js 15+, `params` and `searchParams` are now **Promises** and MUST be awaited before accessing their properties.

### Page Components

```typescript
// CORRECT - Await params before use
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // Now use id...
}

// WRONG - Do NOT access params directly
export default async function Page({
  params,
}: {
  params: { id: string }  // This type is incorrect in Next.js 16
}) {
  const id = params.id  // This will cause errors
}
```

### Layout Components

```typescript
// CORRECT
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <div>{children}</div>
}
```

### SearchParams in Pages

```typescript
// CORRECT
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>
}) {
  const { query, page } = await searchParams
  // Now use query and page...
}
```

### Multiple Dynamic Segments

```typescript
// CORRECT - For routes like /blog/[category]/[slug]
export default async function BlogPost({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  // Now use category and slug...
}
```

## generateMetadata

The `generateMetadata` function also receives params as a Promise:

```typescript
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Item ${id}`,
  }
}
```

## generateStaticParams

When using `generateStaticParams`, return plain objects (not promises):

```typescript
export async function generateStaticParams() {
  const items = await fetchItems()

  return items.map((item) => ({
    id: item.id,  // Plain object, not a promise
  }))
}
```

## Server Components Best Practices

### Default to Server Components

- All components are Server Components by default
- Only add `"use client"` when you need:
  - React hooks (`useState`, `useEffect`, etc.)
  - Event handlers (`onClick`, `onChange`, etc.)
  - Browser APIs (`window`, `localStorage`, etc.)

### Data Fetching

Server Components can fetch data directly:

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchData(id)  // Direct async/await

  return <div>{data.title}</div>
}
```

### Authentication in Server Components

Use Clerk's server-side functions:

```typescript
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Fetch user-specific data...
}
```

## Common Mistakes to Avoid

1. **Forgetting to await params:**
   ```typescript
   // WRONG
   const id = params.id

   // CORRECT
   const { id } = await params
   ```

2. **Using incorrect type for params:**
   ```typescript
   // WRONG
   params: { id: string }

   // CORRECT
   params: Promise<{ id: string }>
   ```

3. **Accessing params in synchronous functions:**
   ```typescript
   // WRONG - Component must be async
   export default function Page({ params }) {
     const { id } = await params  // Error: await in non-async function
   }

   // CORRECT
   export default async function Page({ params }) {
     const { id } = await params
   }
   ```
