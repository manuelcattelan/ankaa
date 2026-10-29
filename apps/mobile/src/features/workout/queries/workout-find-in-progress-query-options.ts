import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";

const program = Effect.gen(function* () {
  const workoutApplicationService = yield* WorkoutApplicationService;

  return yield* workoutApplicationService.findInProgress();
});

export function workoutFindInProgressQueryOptions(runtime: ApplicationRuntime) {
  return queryOptions({
    queryFn: ({ signal }) => runtime.runPromise(program, { signal }),
    queryKey: ["workout", "findInProgress"],
  });
}
