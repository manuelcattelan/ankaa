import type { AppRouter } from "@ankaa/api/trpc/app-router";
import type { inferRouterOutputs } from "@trpc/server";

export type PlannedSet = WorkoutExercise["plannedSets"][number];

export type RecordedSet = WorkoutExercise["recordedSets"][number];

export type Workout = NonNullable<
  inferRouterOutputs<AppRouter>["workout"]["findInProgress"]
>;

export type WorkoutExercise =
  Workout["sections"]["coolDown"][number]["exercises"][number];
