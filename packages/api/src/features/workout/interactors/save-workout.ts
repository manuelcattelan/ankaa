import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";
import type { DrizzleDatabase } from "@ankaa/database";

import { CurrentSession } from "@ankaa/authentication/current-session";
import { Database } from "@ankaa/database";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

import { RoutineNotFoundError } from "../../../shared/errors/routine-not-found-error.ts";
import { buildWorkoutSaveRows } from "../core/build-workout-save-rows.ts";
import { decideWorkoutSave } from "../core/decide-workout-save.ts";
import { WorkoutInProgressConflictError } from "../errors/workout-in-progress-conflict-error.ts";
import { WorkoutNotFoundError } from "../errors/workout-not-found-error.ts";
import { deleteWorkoutExercises } from "../queries/delete-workout-exercises.ts";
import { findWorkoutInProgress } from "../queries/find-workout-in-progress.ts";
import { findWorkoutRoutine } from "../queries/find-workout-routine.ts";
import { findWorkoutWithSameId } from "../queries/find-workout-with-same-id.ts";
import { insertWorkoutExerciseSetSegments } from "../queries/insert-workout-exercise-set-segments.ts";
import { insertWorkoutExerciseSets } from "../queries/insert-workout-exercise-sets.ts";
import { insertWorkoutExercises } from "../queries/insert-workout-exercises.ts";
import { upsertWorkout } from "../queries/upsert-workout.ts";

type WriteWorkoutOptions = {
  database: DrizzleDatabase;
  userId: string;
  workoutSaveInput: WorkoutSaveInput;
};

export const saveWorkout = Effect.fn("saveWorkout")(function* (
  workoutSaveInput: WorkoutSaveInput,
) {
  const database = yield* Database;
  const currentSession = yield* CurrentSession;

  return yield* database
    .transaction(async (transaction) => {
      const workoutRoutine = await findWorkoutRoutine({
        database: transaction,
        routineId: workoutSaveInput.routineId,
        userId: currentSession.user.id,
      });
      const workoutInProgress = await findWorkoutInProgress({
        database: transaction,
        userId: currentSession.user.id,
        workoutId: workoutSaveInput.id,
      });
      const workoutWithSameId = await findWorkoutWithSameId({
        database: transaction,
        workoutId: workoutSaveInput.id,
      });

      const workoutSaveOutcome = decideWorkoutSave({
        userId: currentSession.user.id,
        workoutInProgress,
        workoutRoutine,
        workoutSaveInput,
        workoutWithSameId,
      });

      await Match.valueTags(workoutSaveOutcome, {
        RoutineNotFound: () => Promise.resolve(),
        WorkoutInProgressConflict: () => Promise.resolve(),
        WorkoutNotFound: () => Promise.resolve(),
        WorkoutSaveAllowed: () =>
          writeWorkout({
            database: transaction,
            userId: currentSession.user.id,
            workoutSaveInput,
          }),
        WorkoutVersionAlreadySaved: () => Promise.resolve(),
      });

      return workoutSaveOutcome;
    })
    .pipe(
      Effect.flatMap((workoutSaveOutcome) =>
        Match.valueTags(workoutSaveOutcome, {
          RoutineNotFound: () => Effect.fail(new RoutineNotFoundError()),
          WorkoutInProgressConflict: () =>
            Effect.fail(new WorkoutInProgressConflictError()),
          WorkoutNotFound: () => Effect.fail(new WorkoutNotFoundError()),
          WorkoutSaveAllowed: () => Effect.void,
          WorkoutVersionAlreadySaved: () => Effect.void,
        }),
      ),
    );
});

async function writeWorkout({
  database,
  userId,
  workoutSaveInput,
}: WriteWorkoutOptions) {
  const workoutSaveRows = buildWorkoutSaveRows({ userId, workoutSaveInput });

  await upsertWorkout({ database, workoutRow: workoutSaveRows.workoutRow });

  await deleteWorkoutExercises({ database, workoutId: workoutSaveInput.id });

  await insertWorkoutExercises({
    database,
    workoutExerciseRows: workoutSaveRows.workoutExerciseRows,
  });

  await insertWorkoutExerciseSets({
    database,
    workoutExerciseSetRows: workoutSaveRows.workoutExerciseSetRows,
  });

  await insertWorkoutExerciseSetSegments({
    database,
    workoutExerciseSetSegmentRows:
      workoutSaveRows.workoutExerciseSetSegmentRows,
  });
}
