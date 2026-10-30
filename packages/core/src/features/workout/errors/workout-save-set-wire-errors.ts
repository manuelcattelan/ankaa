import { SegmentCountInvalidError } from "#/features/workout/errors/segment-count-invalid-error.ts";
import { SegmentWeightNotAllowedError } from "#/features/workout/errors/segment-weight-not-allowed-error.ts";
import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";

/**
 * The Wire errors that `workout.saveSet` fails with.
 */
export const WORKOUT_SAVE_SET_WIRE_ERRORS = [
  SegmentCountInvalidError,
  SegmentWeightNotAllowedError,
  WorkoutNotFoundError,
];
