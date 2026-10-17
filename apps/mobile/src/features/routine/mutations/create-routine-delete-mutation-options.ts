import type { RoutineDeleteInput } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";

import { mutationOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { deleteRoutine } from "@/features/routine/interactors/delete-routine";

export function createRoutineDeleteMutationOptions(
  runtime: ApplicationRuntime,
) {
  return mutationOptions({
    mutationFn: (routineDeleteInput: RoutineDeleteInput) =>
      runtime.runPromise(deleteRoutine(routineDeleteInput)),
    mutationKey: ["routine-delete"],
  });
}
