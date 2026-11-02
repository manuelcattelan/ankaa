import type { AbsenceRecordInputEncoded } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";

import { mutationOptions } from "@tanstack/react-query";
import * as Effect from "effect/Effect";

import type { ApplicationRuntime } from "#/layer.ts";

import { AbsenceApplicationService } from "#/features/absence/absence-application-service.ts";

const program = Effect.fn("absenceRecordMutation")(function* (
  input: AbsenceRecordInputEncoded,
) {
  const absenceApplicationService = yield* AbsenceApplicationService;

  return yield* absenceApplicationService.record(input);
});

export function absenceRecordMutationOptions(runtime: ApplicationRuntime) {
  return mutationOptions<
    Effect.Success<ReturnType<typeof program>>,
    Effect.Error<ReturnType<typeof program>>,
    AbsenceRecordInputEncoded
  >({
    mutationFn: (input) => runtime.runPromise(program(input)),
  });
}
