import type { WorkoutSaveSkipInput } from "@ankaa/core/features/workout/schemas/workout-save-skip-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("workoutSaveSkipMutation")(function* (
  input: WorkoutSaveSkipInput,
) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.saveSkip(input);
});

export function workoutSaveSkipMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    WorkoutSaveSkipInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
