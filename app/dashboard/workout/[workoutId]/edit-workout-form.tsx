"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateWorkoutAction } from "./actions";

interface EditWorkoutFormProps {
  workoutId: string;
  initialName: string;
  initialNotes: string;
  initialDate: string;
}

function parseDate(dateString: string): Date | undefined {
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export function EditWorkoutForm({
  workoutId,
  initialName,
  initialNotes,
  initialDate,
}: EditWorkoutFormProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(() => parseDate(initialDate));
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Please select a date");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const result = await updateWorkoutAction({
        id: workoutId,
        name: (formData.get("name") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
        startedAt: date.toISOString(),
      });

      if (result.success) {
        router.push(`/dashboard?date=${result.data.date}`);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Workout Name (optional)</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Push Day, Leg Day, Upper Body"
          defaultValue={initialName}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Date</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              disabled={isSubmitting}
              suppressHydrationWarning
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span suppressHydrationWarning>
                {date ? format(date, "do MMM yyyy") : "Pick a date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any notes about this workout..."
          rows={4}
          defaultValue={initialNotes}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
