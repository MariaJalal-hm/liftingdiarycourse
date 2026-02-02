"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const UpdateWorkoutSchema = z.object({
  id: z.string().min(1, "Workout ID is required"),
  name: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.string().min(1, "Date is required"),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

type ActionResult =
  | { success: true; data: { date: string } }
  | { success: false; error: string };

export async function updateWorkoutAction(
  data: UpdateWorkoutInput
): Promise<ActionResult> {
  const result = UpdateWorkoutSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const workout = await updateWorkout(result.data.id, {
      name: result.data.name || undefined,
      notes: result.data.notes || undefined,
      startedAt: new Date(result.data.startedAt),
    });

    if (!workout) {
      return {
        success: false,
        error: "Workout not found or you don't have permission to edit it.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/workout/${result.data.id}`);

    return {
      success: true,
      data: { date: result.data.startedAt.split("T")[0] },
    };
  } catch (error) {
    console.error("Failed to update workout:", error);
    return {
      success: false,
      error: "Failed to update workout. Please try again.",
    };
  }
}
