import { queryOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { listRoutines } from "@/features/routine/interactors/list-routines";

export function createRoutineListQueryOptions(runtime: ApplicationRuntime) {
  return queryOptions({
    queryFn: () => runtime.runPromise(listRoutines()),
    queryKey: [["routine", "list"], { type: "query" }],
  });
}
