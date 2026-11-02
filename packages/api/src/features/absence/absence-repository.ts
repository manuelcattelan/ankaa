import type { AbsenceEditInput } from "@ankaa/core/features/absence/schemas/absence-edit-input-schema";
import type { AbsenceRecordInput } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";

import { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import { Database } from "@ankaa/database/database";
import { absence } from "@ankaa/database/schema/absence";
import { routine } from "@ankaa/database/schema/routine";
import { eq } from "drizzle-orm";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { catchUniqueIndexViolation } from "#/shared/catch-unique-index-violation.ts";

const ABSENCE_ROUTINE_ID_DATE_KEY = "absence_routine_id_date_key";

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
                [ABSENCE_ROUTINE_ID_DATE_KEY]: new AbsenceDateConflictError(),
              },
            }),
          );
      });

      const findForUpdate = Effect.fn("AbsenceRepository.findForUpdate")(
        function* ({ id }: { id: string }) {
          const absences = yield* database
            .select({ userId: absence.userId })
            .from(absence)
            .where(eq(absence.id, id))
            .for("update")
            .pipe(Effect.orDie);

          return absences[0] ?? null;
        },
      );

      /**
       * Reads the Routine with `id` `FOR SHARE`, the one row a record or an
       * edit locks without changing it, so the record or the edit waits for a
       * deletion of its Routine that is committing, and then sees it deleted.
       */
      const findRoutine = Effect.fn("AbsenceRepository.findRoutine")(
        function* ({ id }: { id: string }) {
          const routines = yield* database
            .select({ deletedAt: routine.deletedAt, userId: routine.userId })
            .from(routine)
            .where(eq(routine.id, id))
            .for("share")
            .pipe(Effect.orDie);

          return routines[0] ?? null;
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
                [ABSENCE_ROUTINE_ID_DATE_KEY]: new AbsenceDateConflictError(),
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
          .delete(absence)
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
