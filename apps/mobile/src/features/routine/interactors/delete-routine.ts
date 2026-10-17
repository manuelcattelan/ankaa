import type { RoutineDeleteInput } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";

import * as Effect from "effect/Effect";

import { TrpcClient } from "@/shared/services/trpc-client";

export const deleteRoutine = Effect.fn("deleteRoutine")(function* (
  routineDeleteInput: RoutineDeleteInput,
) {
  const trpcClient = yield* TrpcClient;

  return yield* trpcClient.request((vanillaTrpcClient) =>
    vanillaTrpcClient.routine.delete.mutate(routineDeleteInput),
  );
});
