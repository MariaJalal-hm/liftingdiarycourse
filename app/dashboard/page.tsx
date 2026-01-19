import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "./date-picker";
import { getWorkoutsForDate } from "@/data/workouts";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const dateString = params.date || format(new Date(), "yyyy-MM-dd");
  const date = new Date(dateString);

  const workouts = await getWorkoutsForDate(date);

  return (
    <main className="container mx-auto max-w-4xl p-6">
      <div className="flex flex-col gap-6">
        {/* Header with Date Picker */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workouts</h1>
            <p className="text-muted-foreground">
              View and log your workouts for the day
            </p>
          </div>

          <DatePicker dateString={dateString} />
        </div>

        {/* Workout List */}
        <div className="flex flex-col gap-4">
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {workout.name || "Workout"}
                  </CardTitle>
                  <CardDescription>
                    {workout.workoutExercises.length} exercise
                    {workout.workoutExercises.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workout.workoutExercises.map((workoutExercise) => {
                      const totalSets = workoutExercise.sets.length;
                      const lastSet = workoutExercise.sets[totalSets - 1];

                      return (
                        <div
                          key={workoutExercise.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <span className="font-medium">
                            {workoutExercise.exercise.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {lastSet?.durationSeconds
                              ? `${Math.floor(lastSet.durationSeconds / 60)} min`
                              : totalSets > 0
                                ? `${totalSets} x ${lastSet?.reps ?? 0} @ ${lastSet?.weight ?? 0} ${lastSet?.weightUnit ?? "lbs"}`
                                : "No sets logged"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-lg font-medium">No workouts logged</h3>
                <p className="text-muted-foreground text-sm">
                  No workouts found for {format(date, "do MMM yyyy")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Workout Button */}
        <Button className="w-full sm:w-auto sm:self-start">
          + Log New Workout
        </Button>
      </div>
    </main>
  );
}
