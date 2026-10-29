import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.fn("stopWorkout")(function* (input: WorkoutStopInput) {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.stop(input);
});

export function workoutStopMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    WorkoutStopInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
