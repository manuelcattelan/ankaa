import { queryOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";

const program = Effect.gen(function* () {
  const routineApplicationService = yield* RoutineApplicationService;

  return yield* routineApplicationService.list();
});

export function routineListQueryOptions(runtime: ApplicationRuntime) {
  return queryOptions({
    queryFn: ({ signal }) => runtime.runPromise(program, { signal }),
    queryKey: ["routine", "list"],
  });
}
