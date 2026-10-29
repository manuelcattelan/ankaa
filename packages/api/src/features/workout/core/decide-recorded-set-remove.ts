import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

/**
 * Decides which Set removing the last Set of a Workout exercise deletes,
 * given the Workout exercise with its Workout, or `null` when none has its
 * id. A Workout exercise with no recorded Set writes nothing and succeeds.
 */
export function decideRecordedSetRemove({
  userId,
  workoutExercise,
}: {
  userId: string;
  workoutExercise: null | {
    recordedSets: readonly { id: string; position: number }[];
    workout: { endedAt: Date | null; userId: string };
  };
}) {
  if (
    workoutExercise?.workout.userId !== userId ||
    workoutExercise.workout.endedAt !== null
  ) {
    return new WorkoutNotFoundError();
  }

  const lastRecordedSet =
    workoutExercise.recordedSets[workoutExercise.recordedSets.length - 1];

  if (lastRecordedSet === undefined) {
    return { _tag: "NoRecordedSetToRemove" as const };
  }

  return { _tag: "RecordedSetRemoveAllowed" as const, id: lastRecordedSet.id };
}
