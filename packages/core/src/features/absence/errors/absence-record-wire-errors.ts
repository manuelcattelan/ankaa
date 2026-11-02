import { AbsenceDateConflictError } from "#/features/absence/errors/absence-date-conflict-error.ts";
import { AbsenceDateInFutureError } from "#/features/absence/errors/absence-date-in-future-error.ts";
import { RoutineNotFoundError } from "#/shared/errors/routine-not-found-error.ts";

/**
 * The Wire errors that `absence.record` fails with.
 */
export const ABSENCE_RECORD_WIRE_ERRORS = [
  AbsenceDateConflictError,
  AbsenceDateInFutureError,
  RoutineNotFoundError,
];
