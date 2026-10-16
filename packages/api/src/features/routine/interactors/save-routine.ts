import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { CurrentSession } from "@ankaa/authentication/current-session";
import { Database } from "@ankaa/database";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

import { buildRoutineSaveRows } from "../core/build-routine-save-rows.ts";
import { decideRoutineSave } from "../core/decide-routine-save.ts";
import { RoutineNameConflictError } from "../errors/routine-name-conflict-error.ts";
import { RoutineNotFoundError } from "../errors/routine-not-found-error.ts";
import { deleteRoutineDays } from "../queries/delete-routine-days.ts";
import { deleteRoutineExercises } from "../queries/delete-routine-exercises.ts";
import { findRoutineWithSameId } from "../queries/find-routine-with-same-id.ts";
import { findRoutinesWithSameName } from "../queries/find-routines-with-same-name.ts";
import { insertRoutineDays } from "../queries/insert-routine-days.ts";
import { insertRoutineExerciseSets } from "../queries/insert-routine-exercise-sets.ts";
import { insertRoutineExercises } from "../queries/insert-routine-exercises.ts";
import { upsertRoutine } from "../queries/upsert-routine.ts";

export const saveRoutine = Effect.fn("saveRoutine")(function* (
  routineSaveInput: RoutineSaveInput,
) {
  const database = yield* Database;
  const currentSession = yield* CurrentSession;

  return yield* database
    .transaction(async (transaction) => {
      const routinesWithSameName = await findRoutinesWithSameName({
        database: transaction,
        routineId: routineSaveInput.id,
        routineName: routineSaveInput.name,
        userId: currentSession.user.id,
      });
      const routineWithSameId = await findRoutineWithSameId({
        database: transaction,
        routineId: routineSaveInput.id,
      });

      const routineSaveOutcome = decideRoutineSave({
        routinesWithSameName,
        routineWithSameId,
        userId: currentSession.user.id,
      });

      if (routineSaveOutcome._tag === "RoutineSaveAllowed") {
        const routineSaveRows = buildRoutineSaveRows({ routineSaveInput });

        await upsertRoutine({
          database: transaction,
          routineId: routineSaveInput.id,
          routineName: routineSaveInput.name,
          userId: currentSession.user.id,
        });

        await deleteRoutineDays({
          database: transaction,
          routineId: routineSaveInput.id,
        });

        await deleteRoutineExercises({
          database: transaction,
          routineId: routineSaveInput.id,
        });

        await insertRoutineDays({
          database: transaction,
          routineDayRows: routineSaveRows.routineDayRows,
        });

        await insertRoutineExercises({
          database: transaction,
          routineExerciseRows: routineSaveRows.routineExerciseRows,
        });

        await insertRoutineExerciseSets({
          database: transaction,
          routineExerciseSetRows: routineSaveRows.routineExerciseSetRows,
        });
      }

      return routineSaveOutcome;
    })
    .pipe(
      Effect.flatMap((routineSaveOutcome) =>
        Match.valueTags(routineSaveOutcome, {
          RoutineNameConflict: () =>
            Effect.fail(new RoutineNameConflictError()),
          RoutineNotFound: () => Effect.fail(new RoutineNotFoundError()),
          RoutineSaveAllowed: () => Effect.void,
        }),
      ),
    );
});
