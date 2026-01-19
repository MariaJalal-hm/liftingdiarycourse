"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: "1",
    name: "Push Day",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 185 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 95 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 12, weight: 60 },
      { name: "Tricep Pushdowns", sets: 3, reps: 15, weight: 50 },
    ],
  },
  {
    id: "2",
    name: "Cardio Session",
    exercises: [
      { name: "Treadmill Run", sets: 1, reps: 1, weight: 0, duration: "30 min" },
      { name: "Rowing Machine", sets: 1, reps: 1, weight: 0, duration: "15 min" },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "do MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Workout List */}
        <div className="flex flex-col gap-4">
          {mockWorkouts.length > 0 ? (
            mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {workout.name}
                  </CardTitle>
                  <CardDescription>
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {"duration" in exercise
                            ? exercise.duration
                            : `${exercise.sets} x ${exercise.reps} @ ${exercise.weight} lbs`}
                        </span>
                      </div>
                    ))}
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
