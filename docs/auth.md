# Authentication Coding Standards

This document defines the mandatory authentication standards for the Lifting Diary project. All contributors must follow these guidelines.

## Authentication Provider: Clerk ONLY

**IMPORTANT: This project exclusively uses [Clerk](https://clerk.com/) for authentication.**

### Rules

1. **NO custom auth** - Do not implement custom authentication logic
2. **Use Clerk for everything** - All auth functionality must use Clerk
3. **Never store passwords** - Clerk handles all credential management

---

## Environment Variables

**Required in `.env.local`:**

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Get these from: https://dashboard.clerk.com/last-active?path=api-keys

### Rules

- **NEVER** commit `.env.local` to git
- **NEVER** hardcode API keys in source code
- **NEVER** expose `CLERK_SECRET_KEY` to the client

---

## Import Rules - CRITICAL

Clerk has separate imports for server and client code. **Using the wrong import will cause errors.**

### Server-Side Imports

```typescript
// CORRECT: Server-side imports
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { auth, currentUser } from "@clerk/nextjs/server";
```

Use in:
- `proxy.ts` (middleware)
- Server Components
- Server Actions
- `/data` helper functions

### Client-Side Imports

```typescript
// CORRECT: Client-side imports
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
```

Use in:
- Client Components (`"use client"`)
- Layout components wrapping the app

### Common Mistakes

```typescript
// WRONG: Using server imports in client components
"use client"
import { auth } from "@clerk/nextjs/server"; // ERROR!

// WRONG: Using client imports in server code
import { SignInButton } from "@clerk/nextjs"; // This is for client only
```

---

## Middleware Configuration

**IMPORTANT: Next.js 16+ uses `proxy.ts`, not `middleware.ts`.**

### File Location

```
/proxy.ts  ← Middleware file (root of project)
```

### Standard Configuration

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Adding Protected Routes

```typescript
// Protect multiple route patterns
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/workouts(.*)",
  "/settings(.*)",
  "/api/protected(.*)",
]);
```

### Rules

- **By default**, `clerkMiddleware()` does NOT protect routes
- **Always use** `createRouteMatcher()` to define protected routes
- **Always call** `await auth.protect()` for protected routes

---

## ClerkProvider Setup

The root layout MUST wrap the app with `<ClerkProvider>`.

### Required Pattern

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Authentication UI Components

### Conditional Rendering

Use `<SignedIn>` and `<SignedOut>` to conditionally render UI:

```tsx
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function AuthHeader() {
  return (
    <div>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button>Sign Up</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
```

### Sign In/Up Modes

```tsx
// Modal mode - Opens in a popup (RECOMMENDED)
<SignInButton mode="modal">
  <button>Sign In</button>
</SignInButton>

// Redirect mode - Navigates to Clerk's hosted page
<SignInButton mode="redirect">
  <button>Sign In</button>
</SignInButton>
```

### UserButton

The `<UserButton />` component provides:
- User avatar
- Account management
- Sign out functionality

```tsx
<SignedIn>
  <UserButton />
</SignedIn>
```

---

## Getting User Data

### In Server Components

```tsx
// CORRECT: Using auth() in Server Components
import { auth } from "@clerk/nextjs/server";

async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, user {userId}</div>;
}
```

### Getting Full User Object

```tsx
import { currentUser } from "@clerk/nextjs/server";

async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <p>Name: {user.firstName} {user.lastName}</p>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

### In Data Helper Functions

```tsx
// data/workouts.ts
import { auth } from "@clerk/nextjs/server";

export async function getWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Use userId in database queries
  return db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
  });
}
```

### Rules

- **Always use `await`** with `auth()` and `currentUser()`
- **Always check** if `userId` exists before proceeding
- **Never trust** client-provided user IDs - always get from `auth()`

---

## Security Checklist

Before writing any auth-related code, verify:

- [ ] Environment variables are in `.env.local` (not committed)
- [ ] `ClerkProvider` wraps the entire app in root layout
- [ ] Protected routes are defined in `proxy.ts`
- [ ] Server functions use `@clerk/nextjs/server` imports
- [ ] Client components use `@clerk/nextjs` imports
- [ ] `auth()` is called with `await` in server code
- [ ] `userId` is validated before database operations
- [ ] User data queries always filter by authenticated `userId`

---

## Common Patterns

### Redirect Unauthenticated Users

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return <div>Protected content</div>;
}
```

### Check Auth in Server Actions

```tsx
"use server";

import { auth } from "@clerk/nextjs/server";

export async function createWorkout(data: WorkoutData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Proceed with authenticated action
}
```

---

## Summary

| Requirement | Standard |
|-------------|----------|
| Auth Provider | Clerk only |
| Custom Auth | **NOT ALLOWED** |
| Middleware File | `proxy.ts` (not `middleware.ts`) |
| Server Imports | `@clerk/nextjs/server` |
| Client Imports | `@clerk/nextjs` |
| Root Layout | Must wrap with `<ClerkProvider>` |
| User ID Source | Always from `auth()`, never from client |
| Route Protection | `createRouteMatcher()` + `auth.protect()` |
