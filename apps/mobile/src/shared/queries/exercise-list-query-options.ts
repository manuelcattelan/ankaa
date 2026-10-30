import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { ExerciseApplicationService } from "#/shared/exercise-application-service.ts";

const program = Effect.gen(function* () {
  const exerciseApplicationService = yield* ExerciseApplicationService;

  return yield* exerciseApplicationService.list();
});

export function exerciseListQueryOptions(runtime: ApplicationRuntime) {
  return queryOptions({
    queryFn: ({ signal }) => runtime.runPromise(program, { signal }),
    queryKey: ["exercise", "list"],
  });
}
