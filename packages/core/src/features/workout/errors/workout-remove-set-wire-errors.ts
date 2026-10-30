import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";

/**
 * The Wire errors that `workout.removeSet` fails with.
 */
export const WORKOUT_REMOVE_SET_WIRE_ERRORS = [WorkoutNotFoundError];
