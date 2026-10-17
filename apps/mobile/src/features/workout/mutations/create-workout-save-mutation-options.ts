import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";

import { mutationOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { isWorkoutSaveErrorRetryable } from "@/features/workout/core/is-workout-save-error-retryable";
import { saveWorkout } from "@/features/workout/interactors/save-workout";

export function createWorkoutSaveMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: (workoutSaveInput: WorkoutSaveInput) =>
      runtime.runPromise(saveWorkout(workoutSaveInput)),
    mutationKey: ["workout-save"],
    retry: (failureCount, error) => isWorkoutSaveErrorRetryable(error),
  });
}
