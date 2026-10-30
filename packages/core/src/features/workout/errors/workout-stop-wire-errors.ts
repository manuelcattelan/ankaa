import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";

/**
 * The Wire errors that `workout.stop` fails with.
 */
export const WORKOUT_STOP_WIRE_ERRORS = [WorkoutNotFoundError];
