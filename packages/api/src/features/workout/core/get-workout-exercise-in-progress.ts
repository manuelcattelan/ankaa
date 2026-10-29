type WorkoutExerciseWithWorkout = {
  workout: { endedAt: Date | null; userId: string };
};

/**
 * Gives the Workout exercise when it belongs to the User's Workout in
 * progress, and `null` when none has its id, when it belongs to another
 * User's Workout, or when its Workout is stopped, which a write treats alike.
 */
export function getWorkoutExerciseInProgress<
  TWorkoutExercise extends WorkoutExerciseWithWorkout,
>({
  userId,
  workoutExercise,
}: {
  userId: string;
  workoutExercise: null | TWorkoutExercise;
}) {
  return workoutExercise?.workout.userId === userId &&
    workoutExercise.workout.endedAt === null
    ? workoutExercise
    : null;
}
