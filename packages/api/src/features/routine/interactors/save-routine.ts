import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";
import type { DrizzleDatabase } from "@ankaa/database";

import { CurrentSession } from "@ankaa/authentication/current-session";
import { Database } from "@ankaa/database";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

import { RoutineNotFoundError } from "../../../shared/errors/routine-not-found-error.ts";
import { buildRoutineSaveRows } from "../core/build-routine-save-rows.ts";
import { decideRoutineSave } from "../core/decide-routine-save.ts";
import { RoutineNameConflictError } from "../errors/routine-name-conflict-error.ts";
import { deleteRoutineDays } from "../queries/delete-routine-days.ts";
import { deleteRoutineExercises } from "../queries/delete-routine-exercises.ts";
import { findRoutineWithSameId } from "../queries/find-routine-with-same-id.ts";
import { findRoutineWithSameName } from "../queries/find-routine-with-same-name.ts";
import { insertRoutineDays } from "../queries/insert-routine-days.ts";
import { insertRoutineExerciseSets } from "../queries/insert-routine-exercise-sets.ts";
import { insertRoutineExercises } from "../queries/insert-routine-exercises.ts";
import { upsertRoutine } from "../queries/upsert-routine.ts";

type WriteRoutineSaveOptions = {
  database: DrizzleDatabase;
  routineSaveInput: RoutineSaveInput;
  userId: string;
};

export const saveRoutine = Effect.fn("saveRoutine")(function* (
  routineSaveInput: RoutineSaveInput,
) {
  const database = yield* Database;
  const currentSession = yield* CurrentSession;

  return yield* database
    .transaction(async (transaction) => {
      const routineWithSameName = await findRoutineWithSameName({
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
        routineWithSameId,
        routineWithSameName,
        userId: currentSession.user.id,
      });

      await Match.valueTags(routineSaveOutcome, {
        RoutineNameConflict: () => Promise.resolve(),
        RoutineNotFound: () => Promise.resolve(),
        RoutineSaveAllowed: () =>
          writeRoutineSave({
            database: transaction,
            routineSaveInput,
            userId: currentSession.user.id,
          }),
      });

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

async function writeRoutineSave({
  database,
  routineSaveInput,
  userId,
}: WriteRoutineSaveOptions) {
  const routineSaveRows = buildRoutineSaveRows({ routineSaveInput });

  await upsertRoutine({
    database,
    routineId: routineSaveInput.id,
    routineName: routineSaveInput.name,
    userId,
  });

  await deleteRoutineDays({ database, routineId: routineSaveInput.id });

  await deleteRoutineExercises({ database, routineId: routineSaveInput.id });

  await insertRoutineDays({
    database,
    routineDayRows: routineSaveRows.routineDayRows,
  });

  await insertRoutineExercises({
    database,
    routineExerciseRows: routineSaveRows.routineExerciseRows,
  });

  await insertRoutineExerciseSets({
    database,
    routineExerciseSetRows: routineSaveRows.routineExerciseSetRows,
  });
}
