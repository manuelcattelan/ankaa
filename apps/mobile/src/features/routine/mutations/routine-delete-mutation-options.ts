import type { RoutineDeleteInput } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";

const program = Effect.fn("routineDeleteMutation")(function* (
  input: RoutineDeleteInput,
) {
  const routineApplicationService = yield* RoutineApplicationService;

  return yield* routineApplicationService.delete(input);
});

export function routineDeleteMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    RoutineDeleteInput
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
