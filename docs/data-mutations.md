# Data Mutations Guidelines

## Critical Rules

**ALL data mutations in this application MUST follow these rules without exception.**

---

## 1. Server Actions ONLY

All data mutations MUST be performed via **Server Actions**. Do NOT use API Route Handlers for mutations.

```tsx
// CORRECT: Use Server Actions for mutations
"use server"

export async function createWorkout(data: CreateWorkoutInput) {
  // Mutation logic here
}
```

---

## 2. Colocated `actions.ts` Files

All Server Actions MUST be defined in colocated files named `actions.ts` within the relevant route directory.

### File Structure

```
/app
  /dashboard
    /page.tsx
    /actions.ts       # Server Actions for dashboard
  /workouts
    /[id]
      /page.tsx
      /actions.ts     # Server Actions for workout detail
    /new
      /page.tsx
      /actions.ts     # Server Actions for creating workouts
```

### Example

```tsx
// app/workouts/new/actions.ts
"use server"

import { createWorkout } from '@/data/workouts';
import { z } from 'zod';

const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(data: CreateWorkoutInput) {
  const validated = CreateWorkoutSchema.parse(data);
  return createWorkout(validated);
}
```

---

## 3. NO FormData - Use Typed Parameters

Server Action parameters must be **typed objects**. Do NOT use `FormData`.

```tsx
// WRONG: Do NOT use FormData
"use server"

export async function createWorkout(formData: FormData) {
  const name = formData.get('name');
  const date = formData.get('date');
  // ...
}
```

```tsx
// CORRECT: Use typed parameters
"use server"

type CreateWorkoutInput = {
  name: string;
  date: string;
};

export async function createWorkout(data: CreateWorkoutInput) {
  const { name, date } = data;
  // ...
}
```

### Why No FormData?

- Type safety at compile time
- Better IDE autocomplete
- Easier testing
- Explicit contract between client and server

### Calling Server Actions from Client Components

```tsx
"use client"

import { createWorkoutAction } from './actions';

function CreateWorkoutForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Extract form data and convert to typed object
    const formData = new FormData(e.currentTarget);

    await createWorkoutAction({
      name: formData.get('name') as string,
      date: formData.get('date') as string,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" required />
      <input name="date" type="date" required />
      <button type="submit">Create Workout</button>
    </form>
  );
}
```

---

## 4. NO Redirects in Server Actions - Use Client-Side Navigation

**Do NOT use `redirect()` from `next/navigation` inside Server Actions.** Redirects must be handled on the client side.

```tsx
// WRONG: Do NOT redirect in Server Actions
"use server"

import { redirect } from 'next/navigation';

export async function createWorkoutAction(data: CreateWorkoutInput) {
  const workout = await createWorkout(data);
  redirect(`/workouts/${workout.id}`); // DO NOT do this
}
```

```tsx
// CORRECT: Return data and redirect on the client
"use server"

export async function createWorkoutAction(data: CreateWorkoutInput) {
  const workout = await createWorkout(data);
  revalidatePath('/dashboard');
  return { success: true, data: { id: workout.id } };
}
```

```tsx
// CORRECT: Client handles the redirect
"use client"

import { useRouter } from 'next/navigation';
import { createWorkoutAction } from './actions';

function CreateWorkoutForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const result = await createWorkoutAction({
      name: formData.get('name') as string,
      date: formData.get('date') as string,
    });

    if (result.success) {
      router.push(`/workouts/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Why No Server-Side Redirects?

- `redirect()` throws a special error internally which can cause "Failed to fetch" errors
- Client-side redirects provide better error handling and user feedback
- Allows showing loading states and error messages before navigation
- More predictable behavior across different scenarios

---

## 5. Zod Validation - REQUIRED

**Every Server Action MUST validate its arguments using Zod.**

### Required Pattern

```tsx
// app/workouts/new/actions.ts
"use server"

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';

// 1. Define the Zod schema
const CreateWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

// 2. Derive the TypeScript type from the schema
type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

// 3. Validate in the Server Action
export async function createWorkoutAction(data: CreateWorkoutInput) {
  // Always validate - never trust client input
  const validated = CreateWorkoutSchema.parse(data);

  return createWorkout(validated);
}
```

### Error Handling with Zod

```tsx
"use server"

import { z } from 'zod';

const UpdateWorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  date: z.string().datetime(),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(data: UpdateWorkoutInput) {
  const result = UpdateWorkoutSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await updateWorkout(result.data);

  return { success: true };
}
```

### Common Zod Patterns

```tsx
import { z } from 'zod';

// String validations
const nameSchema = z.string().min(1).max(100);
const emailSchema = z.string().email();
const uuidSchema = z.string().uuid();

// Number validations
const weightSchema = z.number().positive();
const repsSchema = z.number().int().min(1).max(100);
const setsSchema = z.number().int().min(1).max(20);

// Date validations
const dateSchema = z.string().datetime();
const pastDateSchema = z.string().datetime().refine(
  (date) => new Date(date) < new Date(),
  'Date must be in the past'
);

// Optional with defaults
const notesSchema = z.string().optional().default('');

// Arrays
const exerciseIdsSchema = z.array(z.string().uuid()).min(1);

// Enums
const difficultySchema = z.enum(['easy', 'medium', 'hard']);
```

---

## 6. Database Mutations via `/data` Directory

All database mutations MUST be performed through helper functions in the `/data` directory. Server Actions should NOT contain direct database calls.

### Architecture

```
┌─────────────────────┐
│   Client Component  │
└──────────┬──────────┘
           │ calls
           ▼
┌─────────────────────┐
│   Server Action     │  ← Validates with Zod
│   (actions.ts)      │
└──────────┬──────────┘
           │ calls
           ▼
┌─────────────────────┐
│   Data Helper       │  ← Handles auth & DB operations
│   (/data/*.ts)      │
└──────────┬──────────┘
           │ uses
           ▼
┌─────────────────────┐
│   Drizzle ORM       │
│   (db)              │
└─────────────────────┘
```

### WRONG: Direct DB Calls in Server Actions

```tsx
// WRONG: Do NOT do this
"use server"

import { db } from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkoutAction(data: CreateWorkoutInput) {
  // Do NOT make database calls directly in Server Actions
  await db.insert(workouts).values(data);
}
```

### CORRECT: Use Data Helper Functions

```tsx
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(data: { name: string; date: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const [workout] = await db.insert(workouts)
    .values({
      ...data,
      userId,
    })
    .returning();

  return workout;
}

export async function updateWorkout(id: string, data: { name?: string; date?: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const [workout] = await db.update(workouts)
    .set(data)
    .where(and(
      eq(workouts.id, id),
      eq(workouts.userId, userId),
    ))
    .returning();

  return workout;
}

export async function deleteWorkout(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.delete(workouts)
    .where(and(
      eq(workouts.id, id),
      eq(workouts.userId, userId),
    ));
}
```

```tsx
// app/workouts/new/actions.ts
"use server"

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(data: CreateWorkoutInput) {
  const validated = CreateWorkoutSchema.parse(data);

  const workout = await createWorkout(validated);

  revalidatePath('/dashboard');

  return { success: true, data: { id: workout.id } };
}
```

---

## 7. Revalidation After Mutations

After successful mutations, use `revalidatePath` or `revalidateTag` to update cached data.

```tsx
"use server"

import { revalidatePath } from 'next/cache';

export async function createWorkoutAction(data: CreateWorkoutInput) {
  const validated = CreateWorkoutSchema.parse(data);

  const workout = await createWorkout(validated);

  // Revalidate relevant paths
  revalidatePath('/dashboard');
  revalidatePath('/workouts');

  // Return data for client-side redirect
  return { success: true, data: { id: workout.id } };
}

export async function deleteWorkoutAction(id: string) {
  const validated = z.string().uuid().parse(id);

  await deleteWorkout(validated);

  revalidatePath('/dashboard');
  revalidatePath('/workouts');

  return { success: true };
}
```

---

## 8. Return Types for Server Actions

Server Actions should return consistent result objects for error handling.

### Standard Result Pattern

```tsx
"use server"

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createWorkoutAction(
  data: CreateWorkoutInput
): Promise<ActionResult<{ id: string }>> {
  const result = CreateWorkoutSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const workout = await createWorkout(result.data);

    revalidatePath('/dashboard');

    return {
      success: true,
      data: { id: workout.id },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create workout',
    };
  }
}
```

### Handling Results in Client Components

```tsx
"use client"

import { useRouter } from 'next/navigation';
import { createWorkoutAction } from './actions';
import { useState } from 'react';

function CreateWorkoutForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    const result = await createWorkoutAction({
      name: formData.get('name') as string,
      date: formData.get('date') as string,
    });

    if (!result.success) {
      setError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      return;
    }

    // Success - redirect on the client side
    router.push(`/workouts/${result.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500">{error}</div>}

      <input name="name" type="text" required />
      {fieldErrors.name && (
        <span className="text-red-500">{fieldErrors.name[0]}</span>
      )}

      <input name="date" type="date" required />
      {fieldErrors.date && (
        <span className="text-red-500">{fieldErrors.date[0]}</span>
      )}

      <button type="submit">Create Workout</button>
    </form>
  );
}
```

---

## 9. User Data Isolation - CRITICAL SECURITY

**Every database mutation MUST verify the authenticated user has permission to modify the data.**

This is handled in the `/data` helper functions, NOT in Server Actions.

```tsx
// data/workouts.ts

export async function deleteWorkout(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // CRITICAL: Always filter by userId to prevent unauthorized deletions
  const result = await db.delete(workouts)
    .where(and(
      eq(workouts.id, id),
      eq(workouts.userId, userId), // NEVER omit this
    ))
    .returning();

  if (result.length === 0) {
    throw new Error('Workout not found or unauthorized');
  }

  return result[0];
}
```

---

## Summary

| Rule | Do | Don't |
|------|-----|-------|
| Mutation method | Server Actions | API Route Handlers |
| File location | Colocated `actions.ts` | Random locations |
| Parameters | Typed objects | `FormData` |
| Redirects | Client-side with `router.push()` | `redirect()` in Server Actions |
| Validation | Zod schemas | Manual validation / no validation |
| Database calls | `/data` helper functions | Direct DB calls in actions |
| User auth | Always verify in `/data` helpers | Trust client input |
| After mutation | `revalidatePath` / `revalidateTag` | Manual cache invalidation |

---

## Complete Example

### File Structure

```
/app
  /workouts
    /new
      /page.tsx
      /actions.ts
/data
  /workouts.ts
```

### Data Helper

```tsx
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';

type CreateWorkoutData = {
  name: string;
  date: string;
  notes?: string;
};

export async function createWorkout(data: CreateWorkoutData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const [workout] = await db.insert(workouts)
    .values({
      ...data,
      userId,
    })
    .returning();

  return workout;
}
```

### Server Action

```tsx
// app/workouts/new/actions.ts
"use server"

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

type ActionResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function createWorkoutAction(
  data: CreateWorkoutInput
): Promise<ActionResult> {
  const result = CreateWorkoutSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Validation failed',
    };
  }

  try {
    const workout = await createWorkout(result.data);
    revalidatePath('/dashboard');
    return { success: true, data: { id: workout.id } };
  } catch {
    return { success: false, error: 'Failed to create workout' };
  }
}
```

### Page Component

```tsx
// app/workouts/new/page.tsx
import { CreateWorkoutForm } from './create-workout-form';

export default function NewWorkoutPage() {
  return (
    <div>
      <h1>Create Workout</h1>
      <CreateWorkoutForm />
    </div>
  );
}
```

### Client Component

```tsx
// app/workouts/new/create-workout-form.tsx
"use client"

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createWorkoutAction } from './actions';

export function CreateWorkoutForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createWorkoutAction({
      name: formData.get('name') as string,
      date: new Date(formData.get('date') as string).toISOString(),
      notes: formData.get('notes') as string || undefined,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Redirect on the client side
    router.push(`/workouts/${result.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500">{error}</div>}
      <input name="name" type="text" placeholder="Workout name" required />
      <input name="date" type="date" required />
      <textarea name="notes" placeholder="Notes (optional)" />
      <button type="submit">Create Workout</button>
    </form>
  );
}
```
