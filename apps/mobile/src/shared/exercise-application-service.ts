import type { AppRouter } from "@ankaa/api/trpc/router";
import type { inferRouterOutputs } from "@trpc/server";

import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { TrpcError } from "@/shared/errors/trpc-error";

import { TrpcClient } from "@/shared/services/trpc-client";

export type Exercise =
  inferRouterOutputs<AppRouter>["exercise"]["list"][number];

type ExerciseApplicationServiceShape = {
  readonly list: () => Effect.Effect<Exercise[], TrpcError>;
};

export class ExerciseApplicationService extends Context.Service<
  ExerciseApplicationService,
  ExerciseApplicationServiceShape
>()("@ankaa/mobile/shared/ExerciseApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    ExerciseApplicationService,
    Effect.gen(function* () {
      const trpcClient = yield* TrpcClient;

      const list = Effect.fn("ExerciseApplicationService.list")(function* () {
        return yield* trpcClient.request({
          call: ({ signal, vanillaTrpcClient }) =>
            vanillaTrpcClient.exercise.list.query(undefined, { signal }),
          errors: [],
        });
      });

      return ExerciseApplicationService.of({ list });
    }),
  );

  static readonly layer = ExerciseApplicationService.layerNoDeps.pipe(
    Layer.provide(TrpcClient.layer),
  );
}
