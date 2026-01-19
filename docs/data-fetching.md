# Data Fetching Guidelines

## Critical Rules

**ALL data fetching in this application MUST follow these rules without exception.**

---

## 1. Server Components ONLY

All data fetching MUST be done in **Server Components**.

```tsx
// CORRECT: Fetch data in a Server Component
async function DashboardPage() {
  const workouts = await getWorkouts();

  return (
    <div>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}

export default DashboardPage;
```

---

## 2. NEVER Fetch Data in Client Components

Client Components (`"use client"`) must NEVER fetch data directly.

```tsx
// WRONG: Do NOT do this
"use client"

import { useEffect, useState } from 'react';

function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    // DO NOT fetch data in client components
    fetch('/api/workouts').then(res => res.json()).then(setWorkouts);
  }, []);

  return <div>{/* ... */}</div>;
}
```

**Instead, pass data from Server Components as props:**

```tsx
// CORRECT: Server Component fetches data
async function WorkoutPage() {
  const workouts = await getWorkouts();

  // Pass data to client component as props
  return <WorkoutList workouts={workouts} />;
}

// Client component receives data as props
"use client"

function WorkoutList({ workouts }: { workouts: Workout[] }) {
  // Use the data passed from server
  return <div>{/* ... */}</div>;
}
```

---

## 3. NO Route Handlers for Data Fetching

Do **NOT** create API Route Handlers (`app/api/*/route.ts`) for fetching data.

```tsx
// WRONG: Do NOT create route handlers for data fetching
// app/api/workouts/route.ts
export async function GET() {
  const workouts = await db.query.workouts.findMany();
  return Response.json(workouts);
}
```

Route Handlers should only be used for:
- Webhooks from external services
- Third-party API integrations that require an endpoint
- File uploads/downloads

---

## 4. Database Queries via `/data` Directory

All database queries MUST be performed through helper functions located in the `/data` directory.

### File Structure

```
/data
  /workouts.ts    # Workout-related queries
  /exercises.ts   # Exercise-related queries
  /sets.ts        # Set-related queries
  /users.ts       # User-related queries
```

### Example Helper Function

```tsx
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function getWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    orderBy: (workouts, { desc }) => [desc(workouts.createdAt)],
  });
}

export async function getWorkoutById(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, id),
      eq(workouts.userId, userId) // CRITICAL: Always filter by userId
    ),
  });

  return workout;
}
```

---

## 5. Use Drizzle ORM - NO Raw SQL

All database operations MUST use **Drizzle ORM**. Do NOT write raw SQL queries.

```tsx
// WRONG: Do NOT use raw SQL
const workouts = await db.execute(
  sql`SELECT * FROM workouts WHERE user_id = ${userId}`
);

// CORRECT: Use Drizzle ORM
const workouts = await db.query.workouts.findMany({
  where: eq(workouts.userId, userId),
});
```

### Why Drizzle ORM?

- Type safety
- SQL injection prevention
- Consistent query patterns
- Easier maintenance

---

## 6. User Data Isolation - CRITICAL SECURITY

**Every single database query MUST filter by the authenticated user's ID.**

A user must NEVER be able to access another user's data.

### Required Pattern

```tsx
export async function getWorkoutById(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // ALWAYS include userId in the where clause
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, id),
      eq(workouts.userId, userId) // NEVER omit this
    ),
  });

  return workout;
}
```

### Security Checklist

Before writing any data helper function, verify:

- [ ] `auth()` is called to get the current `userId`
- [ ] Unauthorized users are rejected (no `userId` = throw error)
- [ ] The `userId` is included in EVERY `where` clause
- [ ] Queries cannot return data belonging to other users
- [ ] Updates/deletes also filter by `userId`

### Example: Secure CRUD Operations

```tsx
// CREATE - Associate with current user
export async function createWorkout(data: NewWorkout) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return db.insert(workouts).values({
    ...data,
    userId, // Always set userId on create
  });
}

// READ - Filter by current user
export async function getWorkout(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, id),
      eq(workouts.userId, userId),
    ),
  });
}

// UPDATE - Filter by current user
export async function updateWorkout(id: string, data: Partial<Workout>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return db.update(workouts)
    .set(data)
    .where(and(
      eq(workouts.id, id),
      eq(workouts.userId, userId), // Prevents updating other users' data
    ));
}

// DELETE - Filter by current user
export async function deleteWorkout(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return db.delete(workouts)
    .where(and(
      eq(workouts.id, id),
      eq(workouts.userId, userId), // Prevents deleting other users' data
    ));
}
```

---

## Summary

| Rule | Do | Don't |
|------|-----|-------|
| Where to fetch | Server Components | Client Components |
| API Routes | Only for webhooks/external APIs | Fetching app data |
| Database access | `/data` helper functions | Direct queries in components |
| Query method | Drizzle ORM | Raw SQL |
| Data isolation | Always filter by `userId` | Query without user filter |
