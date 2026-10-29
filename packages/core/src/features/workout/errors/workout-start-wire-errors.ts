import { WorkoutInProgressConflictError } from "#/features/workout/errors/workout-in-progress-conflict-error.ts";
import { WorkoutNotFoundError } from "#/features/workout/errors/workout-not-found-error.ts";
import { RoutineNotFoundError } from "#/shared/errors/routine-not-found-error.ts";

/**
 * The Wire errors that `workout.start` fails with.
 */
export const WORKOUT_START_WIRE_ERRORS = [
  RoutineNotFoundError,
  WorkoutInProgressConflictError,
  WorkoutNotFoundError,
];
