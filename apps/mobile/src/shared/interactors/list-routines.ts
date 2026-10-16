import * as Effect from "effect/Effect";

import { TrpcClient } from "@/shared/services/trpc-client";

export type Routine = Effect.Success<ReturnType<typeof listRoutines>>[number];

export const listRoutines = Effect.fn("listRoutines")(function* () {
  const trpcClient = yield* TrpcClient;

  return yield* trpcClient.request((vanillaTrpcClient) =>
    vanillaTrpcClient.routine.list.query(),
  );
});
