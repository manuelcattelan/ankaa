import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";

/**
 * The Wire errors that `workout.saveNote` fails with.
 */
export const WORKOUT_SAVE_NOTE_WIRE_ERRORS = [WorkoutNotFoundError];
