import type { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import type { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import type { AbsenceRecordInput } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { Database } from "@ankaa/database/database";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";

import { AbsenceRepository } from "#/features/absence/absence-repository.ts";
import { decideAbsenceRecord } from "#/features/absence/core/decide-absence-record.ts";

export class AbsenceApplicationService extends Context.Service<
  AbsenceApplicationService,
  {
    readonly record: (options: {
      input: AbsenceRecordInput;
      userId: string;
    }) => Effect.Effect<
      void,
      AbsenceDateConflictError | AbsenceDateInFutureError | RoutineNotFoundError
    >;
  }
>()("@ankaa/api/features/absence/AbsenceApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    AbsenceApplicationService,
    Effect.gen(function* () {
      const database = yield* Database;
      const absenceRepository = yield* AbsenceRepository;

      const record = Effect.fn("AbsenceApplicationService.record")(function* ({
        input,
        userId,
      }: {
        input: AbsenceRecordInput;
        userId: string;
      }) {
        const now = yield* DateTime.now;

        yield* database
          .transaction(() =>
            Effect.gen(function* () {
              const routine = yield* absenceRepository.findRoutine({
                id: input.routineId,
              });

              yield* Match.valueTags(
                decideAbsenceRecord({
                  date: input.date,
                  now,
                  routine,
                  timeZone: input.timeZone,
                  userId,
                }),
                {
                  AbsenceDateInFutureError: (error) => Effect.fail(error),
                  AbsenceRecordAllowed: () =>
                    absenceRepository.record({ input, userId }),
                  RoutineNotFoundError: (error) => Effect.fail(error),
                },
              );
            }),
          )
          .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
      });

      return AbsenceApplicationService.of({ record });
    }),
  );

  static readonly layer = AbsenceApplicationService.layerNoDeps.pipe(
    Layer.provide([AbsenceRepository.layer, Database.layer]),
  );
}
