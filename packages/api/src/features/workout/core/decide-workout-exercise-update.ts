import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

/**
 * Decides whether a Save may update a Workout exercise in place, such as its
 * note or its skip, given the Workout exercise with its Workout, or `null`
 * when none has its id.
 */
export function decideWorkoutExerciseUpdate({
  userId,
  workoutExercise,
}: {
  userId: string;
  workoutExercise: null | {
    workout: { endedAt: Date | null; userId: string };
  };
}) {
  if (
    workoutExercise?.workout.userId !== userId ||
    workoutExercise.workout.endedAt !== null
  ) {
    return new WorkoutNotFoundError();
  }

  return { _tag: "WorkoutExerciseUpdateAllowed" as const };
}
