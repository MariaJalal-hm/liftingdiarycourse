"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const CreateWorkoutSchema = z.object({
  name: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.string().min(1, "Date is required"),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

type ActionResult =
  | { success: true; data: { date: string } }
  | { success: false; error: string };

export async function createWorkoutAction(
  data: CreateWorkoutInput
): Promise<ActionResult> {
  const result = CreateWorkoutSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || "Validation failed",
    };
  }

  try {
    await createWorkout({
      name: result.data.name || undefined,
      notes: result.data.notes || undefined,
      startedAt: new Date(result.data.startedAt),
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: { date: result.data.startedAt.split("T")[0] },
    };
  } catch (error) {
    console.error("Failed to create workout:", error);
    return {
      success: false,
      error: "Failed to create workout. Please try again.",
    };
  }
}
