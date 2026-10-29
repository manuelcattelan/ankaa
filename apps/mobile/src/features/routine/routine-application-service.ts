import type { RoutineDeleteInput } from "@ankaa/core/features/routine/schemas/routine-delete-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { ROUTINE_DELETE_WIRE_ERRORS } from "@ankaa/core/features/routine/errors/routine-delete-wire-errors";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { constUndefined } from "effect/Function";
import * as Layer from "effect/Layer";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";
import type { Routine } from "#/shared/routine.ts";

import { TrpcClient } from "#/shared/services/trpc-client.ts";

export class RoutineApplicationService extends Context.Service<
  RoutineApplicationService,
  {
    readonly delete: (
      input: RoutineDeleteInput,
    ) => Effect.Effect<void, RoutineNotFoundError | TrpcClientError>;
    readonly list: () => Effect.Effect<Routine[], TrpcClientError>;
  }
>()("@ankaa/mobile/features/routine/RoutineApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    RoutineApplicationService,
    Effect.gen(function* () {
      const trpcClient = yield* TrpcClient;

      const deleteRoutine = Effect.fn("RoutineApplicationService.delete")(
        function* (input: RoutineDeleteInput) {
          yield* trpcClient.request({
            call: ({ signal, trpc }) =>
              trpc.routine.delete.mutate(input, { signal }),
            errors: ROUTINE_DELETE_WIRE_ERRORS,
          });
        },
      );

      const list = Effect.fn("RoutineApplicationService.list")(function* () {
        return yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.routine.list.query(constUndefined(), { signal }),
          errors: [],
        });
      });

      return RoutineApplicationService.of({ delete: deleteRoutine, list });
    }),
  );

  static readonly layer = RoutineApplicationService.layerNoDeps.pipe(
    Layer.provide(TrpcClient.layer),
  );
}
