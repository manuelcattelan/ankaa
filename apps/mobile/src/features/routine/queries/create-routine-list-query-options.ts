import { queryOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { listRoutines } from "@/shared/interactors/list-routines";

export function createRoutineListQueryOptions(runtime: ApplicationRuntime) {
  return queryOptions({
    queryFn: () => runtime.runPromise(listRoutines()),
    queryKey: [["routine", "list"], { type: "query" }],
  });
}
