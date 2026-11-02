import { SkipConflictError } from "#/features/workout/errors/skip-conflict-error.ts";
import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";

/**
 * The Wire errors that `workout.removeSet` fails with.
 */
export const WORKOUT_REMOVE_SET_WIRE_ERRORS = [
  SkipConflictError,
  WorkoutNotFoundError,
];
