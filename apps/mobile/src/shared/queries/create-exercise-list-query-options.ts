import { queryOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { listExercises } from "@/shared/interactors/list-exercises";

export function createExerciseListQueryOptions(runtime: ApplicationRuntime) {
  return queryOptions({
    queryFn: () => runtime.runPromise(listExercises()),
    queryKey: [["exercise", "list"], { type: "query" }],
  });
}
