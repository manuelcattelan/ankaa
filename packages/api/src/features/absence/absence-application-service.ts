import type { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import type { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import type { AbsenceNotFoundError } from "@ankaa/core/features/absence/errors/absence-not-found-error";
import type { AbsenceEditInput } from "@ankaa/core/features/absence/schemas/absence-edit-input-schema";
import type { AbsenceRecordInput } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";
import type { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";

import { Database } from "@ankaa/database/database";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";

import { AbsenceRepository } from "#/features/absence/absence-repository.ts";
import { decideAbsenceEdit } from "#/features/absence/core/decide-absence-edit.ts";
import { decideAbsenceRecord } from "#/features/absence/core/decide-absence-record.ts";
import { decideAbsenceRemove } from "#/features/absence/core/decide-absence-remove.ts";

export class AbsenceApplicationService extends Context.Service<
  AbsenceApplicationService,
  {
    readonly edit: (options: {
      input: AbsenceEditInput;
      userId: string;
    }) => Effect.Effect<
      void,
      | AbsenceDateConflictError
      | AbsenceDateInFutureError
      | AbsenceNotFoundError
      | RoutineNotFoundError
    >;
    readonly record: (options: {
      input: AbsenceRecordInput;
      userId: string;
    }) => Effect.Effect<
      void,
      AbsenceDateConflictError | AbsenceDateInFutureError | RoutineNotFoundError
    >;
    readonly remove: (options: {
      id: string;
      userId: string;
    }) => Effect.Effect<void, AbsenceNotFoundError>;
  }
>()("@ankaa/api/features/absence/AbsenceApplicationService") {
  static readonly layerNoDeps = Layer.effect(
    AbsenceApplicationService,
    Effect.gen(function* () {
      const database = yield* Database;
      const absenceRepository = yield* AbsenceRepository;

      const edit = Effect.fn("AbsenceApplicationService.edit")(function* ({
        input,
        userId,
      }: {
        input: AbsenceEditInput;
        userId: string;
      }) {
        const now = yield* DateTime.now;

        yield* database
          .transaction(() =>
            Effect.gen(function* () {
              const absence = yield* absenceRepository.findForUpdate({
                id: input.id,
              });
              const routine = yield* absenceRepository.findRoutine({
                id: input.routineId,
              });

              yield* Match.valueTags(
                decideAbsenceEdit({
                  absence,
                  date: input.date,
                  now,
                  routine,
                  timeZone: input.timeZone,
                  userId,
                }),
                {
                  AbsenceDateInFutureError: (error) => Effect.fail(error),
                  AbsenceEditAllowed: () => absenceRepository.edit({ input }),
                  AbsenceNotFoundError: (error) => Effect.fail(error),
                  RoutineNotFoundError: (error) => Effect.fail(error),
                },
              );
            }),
          )
          .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
      });

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

      const remove = Effect.fn("AbsenceApplicationService.remove")(function* ({
        id,
        userId,
      }: {
        id: string;
        userId: string;
      }) {
        yield* database
          .transaction(() =>
            Effect.gen(function* () {
              const absence = yield* absenceRepository.findForUpdate({ id });

              yield* Match.valueTags(decideAbsenceRemove({ absence, userId }), {
                AbsenceAlreadyRemoved: () => Effect.void,
                AbsenceNotFoundError: (error) => Effect.fail(error),
                AbsenceRemoveAllowed: () => absenceRepository.remove({ id }),
              });
            }),
          )
          .pipe(Effect.catchTag("SqlError", (error) => Effect.die(error)));
      });

      return AbsenceApplicationService.of({ edit, record, remove });
    }),
  );

  static readonly layer = AbsenceApplicationService.layerNoDeps.pipe(
    Layer.provide([AbsenceRepository.layer, Database.layer]),
  );
}
