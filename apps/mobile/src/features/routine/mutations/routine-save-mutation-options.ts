import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";

const program = Effect.fn("saveRoutine")(function* (input: RoutineSaveInput) {
  const routineApplicationService = yield* RoutineApplicationService;

  return yield* routineApplicationService.save(input);
});

export function routineSaveMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    RoutineSaveInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
