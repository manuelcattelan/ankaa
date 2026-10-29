import { use } from "react";

import { WorkoutContext } from "#/features/workout/providers/workout-context.ts";

export function useWorkoutContext() {
  const workoutContext = use(WorkoutContext);

  if (workoutContext === null) {
    throw new Error("useWorkoutContext must be called inside WorkoutContext");
  }

  return workoutContext;
}
