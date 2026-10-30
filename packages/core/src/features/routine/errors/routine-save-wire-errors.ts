import { RoutineNameConflictError } from "#/features/routine/errors/routine-name-conflict-error.ts";
import { RoutineNotFoundError } from "#/shared/errors/routine-not-found-error.ts";

/**
 * The Wire errors that `routine.save` fails with.
 */
export const ROUTINE_SAVE_WIRE_ERRORS = [
  RoutineNameConflictError,
  RoutineNotFoundError,
];
