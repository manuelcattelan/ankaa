import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";

import { getWorkoutExerciseInProgress } from "#/features/workout/core/get-workout-exercise-in-progress.ts";

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
  const workoutExerciseInProgress = getWorkoutExerciseInProgress({
    userId,
    workoutExercise,
  });

  if (workoutExerciseInProgress === null) {
    return new WorkoutNotFoundError();
  }

  return { _tag: "WorkoutExerciseUpdateAllowed" as const };
}
