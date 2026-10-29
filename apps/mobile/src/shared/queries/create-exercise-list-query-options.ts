import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "@/layer";

import { ExerciseApplicationService } from "@/shared/exercise-application-service";

const program = Effect.gen(function* () {
  const exerciseApplicationService = yield* ExerciseApplicationService;

  return yield* exerciseApplicationService.list();
});

export function createExerciseListQueryOptions(runtime: ApplicationRuntime) {
  return queryOptions({
    queryFn: ({ signal }) => runtime.runPromise(program, { signal }),
    queryKey: ["exercise", "list"],
  });
}
