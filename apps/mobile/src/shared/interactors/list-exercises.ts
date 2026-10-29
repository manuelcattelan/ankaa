import * as Effect from "effect/Effect";

import { TrpcClient } from "@/shared/services/trpc-client";

export type Exercise = Effect.Success<ReturnType<typeof listExercises>>[number];

export const listExercises = Effect.fn("listExercises")(function* () {
  const trpcClient = yield* TrpcClient;

  return yield* trpcClient.request({
    call: (vanillaTrpcClient) => vanillaTrpcClient.exercise.list.query(),
    errors: [],
  });
});
