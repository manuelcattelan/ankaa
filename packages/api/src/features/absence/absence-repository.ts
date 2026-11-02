import type { AbsenceEditInput } from "@ankaa/core/features/absence/schemas/absence-edit-input-schema";
import type { AbsenceRecordInput } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";
import type { routine } from "@ankaa/database/schema/routine";

import { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import { Database } from "@ankaa/database/database";
import { absence } from "@ankaa/database/schema/absence";
import { and, eq, isNull, sql } from "drizzle-orm";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { catchUniqueIndexViolation } from "#/shared/catch-unique-index-violation.ts";
import { shareRoutine } from "#/shared/share-routine.ts";

const ABSENCE_LIVE_ROUTINE_ID_DATE_INDEX = "absence_live_routine_id_date_idx";

export class AbsenceRepository extends Context.Service<
  AbsenceRepository,
  {
    readonly edit: (options: {
      input: AbsenceEditInput;
    }) => Effect.Effect<void, AbsenceDateConflictError>;
    readonly findForUpdate: (options: {
      id: string;
    }) => Effect.Effect<null | Pick<typeof absence.$inferSelect, "userId">>;
    readonly findRoutine: (options: {
      id: string;
    }) => Effect.Effect<null | Pick<
      typeof routine.$inferSelect,
      "deletedAt" | "userId"
    >>;
    readonly record: (options: {
      input: AbsenceRecordInput;
      userId: string;
    }) => Effect.Effect<void, AbsenceDateConflictError>;
    readonly remove: (options: { id: string }) => Effect.Effect<void>;
  }
>()("@ankaa/api/features/absence/AbsenceRepository") {
  static readonly layerNoDeps = Layer.effect(
    AbsenceRepository,
    Effect.gen(function* () {
      const database = yield* Database;

      const edit = Effect.fn("AbsenceRepository.edit")(function* ({
        input,
      }: {
        input: AbsenceEditInput;
      }) {
        yield* database
          .update(absence)
          .set({
            date: input.date,
            note: input.note,
            reason: input.reason,
            routineId: input.routineId,
          })
          .where(eq(absence.id, input.id))
          .pipe(
            catchUniqueIndexViolation({
              errors: {
                [ABSENCE_LIVE_ROUTINE_ID_DATE_INDEX]:
                  new AbsenceDateConflictError(),
              },
            }),
          );
      });

      /**
       * Locks the Absence with `id` for the write, or gives null when none
       * has it, or when the User removed it, because a removed Absence is
       * gone for every procedure.
       */
      const findForUpdate = Effect.fn("AbsenceRepository.findForUpdate")(
        function* ({ id }: { id: string }) {
          const absences = yield* database
            .select({ userId: absence.userId })
            .from(absence)
            .where(and(eq(absence.id, id), isNull(absence.deletedAt)))
            .for("update")
            .pipe(Effect.orDie);

          return absences[0] ?? null;
        },
      );

      const findRoutine = Effect.fn("AbsenceRepository.findRoutine")(
        function* ({ id }: { id: string }) {
          return yield* shareRoutine({ database, id });
        },
      );

      const record = Effect.fn("AbsenceRepository.record")(function* ({
        input,
        userId,
      }: {
        input: AbsenceRecordInput;
        userId: string;
      }) {
        yield* database
          .insert(absence)
          .values({
            date: input.date,
            note: input.note,
            reason: input.reason,
            routineId: input.routineId,
            userId,
          })
          .pipe(
            catchUniqueIndexViolation({
              errors: {
                [ABSENCE_LIVE_ROUTINE_ID_DATE_INDEX]:
                  new AbsenceDateConflictError(),
              },
            }),
          );
      });

      const remove = Effect.fn("AbsenceRepository.remove")(function* ({
        id,
      }: {
        id: string;
      }) {
        yield* database
          .update(absence)
          .set({ deletedAt: sql`now()` })
          .where(eq(absence.id, id))
          .pipe(Effect.orDie);
      });

      return AbsenceRepository.of({
        edit,
        findForUpdate,
        findRoutine,
        record,
        remove,
      });
    }),
  );

  static readonly layer = AbsenceRepository.layerNoDeps.pipe(
    Layer.provide(Database.layer),
  );
}
