import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";

/**
 * The Wire errors that `workout.skipExercise` fails with.
 */
export const WORKOUT_SKIP_EXERCISE_WIRE_ERRORS = [WorkoutNotFoundError];
