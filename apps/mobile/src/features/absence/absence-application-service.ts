import type { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import type { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import type { AbsenceRecordInputEncoded } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { ABSENCE_RECORD_WIRE_ERRORS } from "@ankaa/core/features/absence/errors/absence-record-wire-errors";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { TrpcClientError } from "#/shared/errors/trpc-client-error.ts";

import { TrpcClient } from "#/shared/services/trpc-client.ts";

export class AbsenceApplicationService extends Context.Service<
  AbsenceApplicationService,
  {
    readonly record: (
      input: AbsenceRecordInputEncoded,
    ) => Effect.Effect<
      void,
      | AbsenceDateConflictError
      | AbsenceDateInFutureError
      | RoutineNotFoundError
      | TrpcClientError
    >;
  }
>()("@ankaa/mobile/features/absence/AbsenceApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    AbsenceApplicationService,
    Effect.gen(function* () {
      const trpcClient = yield* TrpcClient;

      const record = Effect.fn("AbsenceApplicationService.record")(function* (
        input: AbsenceRecordInputEncoded,
      ) {
        yield* trpcClient.request({
          call: ({ signal, trpc }) =>
            trpc.absence.record.mutate(input, { signal }),
          errors: ABSENCE_RECORD_WIRE_ERRORS,
        });
      });

      return AbsenceApplicationService.of({ record });
    }),
  );

  static readonly layer = AbsenceApplicationService.layerNoDeps.pipe(
    Layer.provide(TrpcClient.layer),
  );
}
