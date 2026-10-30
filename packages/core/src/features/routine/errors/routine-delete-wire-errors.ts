import { RoutineNotFoundError } from "#/shared/errors/routine-not-found-error.ts";

/**
 * The Wire errors that `routine.delete` fails with.
 */
export const ROUTINE_DELETE_WIRE_ERRORS = [RoutineNotFoundError];
