import type { WorkoutRemoveSetInput } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("workoutRemoveSetMutation")(function* (
  input: WorkoutRemoveSetInput,
) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.removeSet(input);
});

export function workoutRemoveSetMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    WorkoutRemoveSetInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
