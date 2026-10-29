import type { WorkoutRemoveSetInput } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";

import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import { getWorkoutExerciseInProgress } from "#/features/workout/core/get-workout-exercise-in-progress.ts";

/**
 * Decides how removing a recorded Set writes, given the Workout exercise with
 * its Workout, or `null` when none has its id. Each recorded Set after the
 * removed one moves up one position, so it still matches the planned Set at
 * its position. Removing a Set the Workout exercise no longer records writes
 * nothing and succeeds, so a removal retried after a lost response never
 * removes a second Set.
 */
export function decideRecordedSetRemove({
  input,
  userId,
  workoutExercise,
}: {
  input: Pick<WorkoutRemoveSetInput, "id">;
  userId: string;
  workoutExercise: null | {
    recordedSets: readonly { id: string; position: number }[];
    workout: { endedAt: Date | null; userId: string };
  };
}) {
  const workoutExerciseInProgress = getWorkoutExerciseInProgress({
    userId,
    workoutExercise,
  });

  if (workoutExerciseInProgress === null) {
    return new WorkoutNotFoundError();
  }

  const removedRecordedSet = workoutExerciseInProgress.recordedSets.find(
    (recordedSet) => recordedSet.id === input.id,
  );

  if (removedRecordedSet === undefined) {
    return { _tag: "RecordedSetAlreadyRemoved" as const };
  }

  return {
    _tag: "RecordedSetRemoveAllowed" as const,
    id: removedRecordedSet.id,
    movedRecordedSets: workoutExerciseInProgress.recordedSets
      .filter(
        (recordedSet) => recordedSet.position > removedRecordedSet.position,
      )
      .map((recordedSet) => ({
        id: recordedSet.id,
        position: recordedSet.position - 1,
      })),
  };
}
