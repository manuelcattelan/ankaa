import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { mutationOptions } from "@tanstack/react-query";

import type { ApplicationRuntime } from "@/layer";

import { saveRoutine } from "@/features/routine/interactors/save-routine";

export function createRoutineSaveMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions({
    mutationFn: (routineSaveInput: RoutineSaveInput) =>
      runtime.runPromise(saveRoutine(routineSaveInput)),
    mutationKey: ["routine-save"],
  });
}
