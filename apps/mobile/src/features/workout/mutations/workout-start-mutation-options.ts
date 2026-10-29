import type { WorkoutStartInput } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("startWorkout")(function* (input: WorkoutStartInput) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.start(input);
});

export function workoutStartMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    WorkoutStartInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
