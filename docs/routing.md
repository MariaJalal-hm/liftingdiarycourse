# Routing

This document outlines the routing standards for this Next.js 16 application.

## Route Structure

All application routes are accessed via `/dashboard`. The root `/` path is the public landing page only.

```
/                       # Public landing page
/dashboard              # Protected - Main dashboard
/dashboard/workout      # Protected - Workout list
/dashboard/workout/new  # Protected - Create new workout
/dashboard/workout/[id] # Protected - View/edit workout
/dashboard/settings     # Protected - User settings
```

## Route Protection

**All `/dashboard` routes are protected** and only accessible by authenticated users.

### Middleware-Based Protection

Route protection is handled in the Next.js middleware (`proxy.ts`), NOT in individual page components:

```typescript
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
  },
  { clockSkewInMs: 60000 }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### How It Works

1. `createRouteMatcher(["/dashboard(.*)"])` matches any route starting with `/dashboard`
2. When a protected route is accessed, `auth.protect()` checks for authentication
3. Unauthenticated users are automatically redirected to the Clerk sign-in page
4. After sign-in, users are redirected back to their original destination

## Adding New Protected Routes

When adding new routes under `/dashboard`, they are **automatically protected** by the middleware. No additional configuration is needed.

```
/dashboard/new-feature     # Automatically protected
/dashboard/new-feature/sub # Automatically protected
```

## Adding New Public Routes

If you need a public route outside of `/dashboard`:

1. Create the route in the `app/` directory (e.g., `app/about/page.tsx`)
2. It will be public by default since it doesn't match `/dashboard(.*)`

If you need to protect additional routes outside `/dashboard`, update the middleware:

```typescript
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",      // Add new protected patterns here
  "/api/protected(.*)"
]);
```

## Best Practices

### DO

- Keep all authenticated features under `/dashboard`
- Rely on middleware for route protection
- Use the `auth()` function in Server Components to get the user ID for data fetching

### DON'T

- Don't add manual auth checks in page components for route protection
- Don't create protected routes outside of `/dashboard` without updating middleware
- Don't use client-side redirects for authentication (middleware handles this)

## Accessing User in Protected Routes

Since protected routes guarantee authentication, you can safely use `auth()`:

```typescript
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  // userId is guaranteed to exist in protected routes
  const data = await fetchUserData(userId!);

  return <div>{/* ... */}</div>;
}
```

## Dynamic Route Segments

For dynamic routes under `/dashboard`, remember to await params (Next.js 16 requirement):

```typescript
// app/dashboard/workout/[workoutId]/page.tsx
import { auth } from "@clerk/nextjs/server";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  const { workoutId } = await params;

  const workout = await getWorkout(workoutId, userId!);

  return <div>{/* ... */}</div>;
}
```
