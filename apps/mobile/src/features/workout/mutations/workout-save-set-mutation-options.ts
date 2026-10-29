import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("saveSet")(function* (input: WorkoutSaveSetInput) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.saveSet(input);
});

export function workoutSaveSetMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    WorkoutSaveSetInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
