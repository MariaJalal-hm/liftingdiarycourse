import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateWorkoutForm } from "./create-workout-form";

interface NewWorkoutPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewWorkoutPage({
  searchParams,
}: NewWorkoutPageProps) {
  const params = await searchParams;

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
            <h1 className="text-2xl font-bold">New Workout</h1>
            <p className="text-muted-foreground">Log a new workout session</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
            <CardDescription>
              Fill in the details for your workout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkoutForm initialDate={params.date} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
