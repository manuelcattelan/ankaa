import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import * as Effect from "effect/Effect";

import { TrpcClient } from "@/shared/services/trpc-client";

export const saveRoutine = Effect.fn("saveRoutine")(function* (
  routineSaveInput: RoutineSaveInput,
) {
  const trpcClient = yield* TrpcClient;

  return yield* trpcClient.request((vanillaTrpcClient) =>
    vanillaTrpcClient.routine.save.mutate(routineSaveInput),
  );
});
