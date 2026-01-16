import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ========================================
// WORKOUTS TABLE
// ========================================
// Stores workout sessions for each user
export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
    name: varchar("name", { length: 255 }), // Optional workout name
    notes: text("notes"), // Workout-level notes
    startedAt: timestamp("started_at", { mode: "date" }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { mode: "date" }), // null = in progress
    durationMinutes: integer("duration_minutes"), // Calculated or manual duration
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("workouts_user_id_idx").on(table.userId),
    userStartedAtIdx: index("workouts_user_started_at_idx").on(
      table.userId,
      table.startedAt
    ),
  })
);

// ========================================
// EXERCISE CATEGORIES TABLE
// ========================================
// Categories for organizing exercises (e.g., Chest, Back, Legs)
export const exerciseCategories = pgTable(
  "exercise_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("exercise_categories_name_idx").on(table.name),
  })
);

// ========================================
// EXERCISES TABLE
// ========================================
// Master exercise library (both global preset and user-custom exercises)
export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 }), // null = global, non-null = user-created
    categoryId: uuid("category_id").references(() => exerciseCategories.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"), // Instructions or tips
    defaultWeightUnit: varchar("default_weight_unit", { length: 10 }).default(
      "lbs"
    ), // "lbs" | "kg"
    isBodyweight: boolean("is_bodyweight").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("exercises_user_id_idx").on(table.userId),
    categoryIdIdx: index("exercises_category_id_idx").on(table.categoryId),
    userNameIdx: index("exercises_user_name_idx").on(table.userId, table.name),
  })
);

// ========================================
// WORKOUT EXERCISES TABLE
// ========================================
// Junction table linking workouts to exercises (many-to-many)
export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    exerciseOrder: integer("exercise_order").notNull(), // Order in workout (1st, 2nd, 3rd exercise)
    notes: text("notes"), // Exercise-specific notes for this workout
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    workoutIdIdx: index("workout_exercises_workout_id_idx").on(table.workoutId),
    exerciseIdIdx: index("workout_exercises_exercise_id_idx").on(
      table.exerciseId
    ),
    workoutOrderIdx: index("workout_exercises_workout_order_idx").on(
      table.workoutId,
      table.exerciseOrder
    ),
    // Ensure unique ordering within a workout
    uniqueWorkoutOrder: unique("workout_exercises_workout_order_unique").on(
      table.workoutId,
      table.exerciseOrder
    ),
  })
);

// ========================================
// SETS TABLE
// ========================================
// Individual sets for each exercise in a workout
export const sets = pgTable(
  "sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutExerciseId: uuid("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(), // 1st set, 2nd set, etc.
    weight: decimal("weight", { precision: 10, scale: 2 }), // Weight used
    weightUnit: varchar("weight_unit", { length: 10 }), // "lbs" | "kg"
    reps: integer("reps"), // Repetitions completed
    rpe: decimal("rpe", { precision: 3, scale: 1 }), // Rate of Perceived Exertion (1-10)
    distanceMeters: decimal("distance_meters", { precision: 10, scale: 2 }), // For cardio/rowing
    durationSeconds: integer("duration_seconds"), // For timed exercises (planks, etc.)
    isWarmup: boolean("is_warmup").default(false),
    isDropset: boolean("is_dropset").default(false),
    notes: text("notes"), // Set-specific notes
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    workoutExerciseIdIdx: index("sets_workout_exercise_id_idx").on(
      table.workoutExerciseId
    ),
    workoutExerciseSetIdx: index("sets_workout_exercise_set_idx").on(
      table.workoutExerciseId,
      table.setNumber
    ),
    // Ensure unique set numbers within a workout exercise
    uniqueSetNumber: unique("sets_workout_exercise_set_unique").on(
      table.workoutExerciseId,
      table.setNumber
    ),
  })
);

// ========================================
// TYPE EXPORTS (for TypeScript inference)
// ========================================
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type ExerciseCategory = typeof exerciseCategories.$inferSelect;
export type NewExerciseCategory = typeof exerciseCategories.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
