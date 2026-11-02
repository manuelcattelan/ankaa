import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";

/**
 * The Wire errors that `workout.saveSkip` fails with.
 */
export const WORKOUT_SAVE_SKIP_WIRE_ERRORS = [WorkoutNotFoundError];
