import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./edit-workout-form";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({
  params,
}: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-xl p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Workout</h1>
            <p className="text-muted-foreground">Update your workout details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
            <CardDescription>
              Make changes to your workout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm
              workoutId={workout.id}
              initialName={workout.name || ""}
              initialNotes={workout.notes || ""}
              initialDate={
                workout.startedAt instanceof Date
                  ? workout.startedAt.toISOString()
                  : String(workout.startedAt)
              }
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
