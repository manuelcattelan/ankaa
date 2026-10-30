import type { WorkoutSkipExerciseInput } from "@ankaa/core/features/workout/schemas/workout-skip-exercise-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("workoutSkipExerciseMutation")(function* (
  input: WorkoutSkipExerciseInput,
) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.skipExercise(input);
});

export function workoutSkipExerciseMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    WorkoutSkipExerciseInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
