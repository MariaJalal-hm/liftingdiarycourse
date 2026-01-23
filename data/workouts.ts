import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsForDate(date: Date) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("[getWorkoutsForDate] No userId found");
      return [];
    }

    // Get start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const userWorkouts = await db.query.workouts.findMany({
      where: and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      ),
      with: {
        workoutExercises: {
          orderBy: (workoutExercises, { asc }) => [
            asc(workoutExercises.exerciseOrder),
          ],
          with: {
            exercise: true,
            sets: {
              orderBy: (sets, { asc }) => [asc(sets.setNumber)],
            },
          },
        },
      },
      orderBy: (workouts, { desc }) => [desc(workouts.startedAt)],
    });

    return userWorkouts;
  } catch (error) {
    console.error("[getWorkoutsForDate] Error:", error);
    return [];
  }
}

export async function getWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    orderBy: (workouts, { desc }) => [desc(workouts.createdAt)],
  });
}

type CreateWorkoutData = {
  name?: string;
  notes?: string;
  startedAt: Date;
};

export async function createWorkout(data: CreateWorkoutData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name || null,
      notes: data.notes || null,
      startedAt: data.startedAt,
    })
    .returning();

  return workout;
}
