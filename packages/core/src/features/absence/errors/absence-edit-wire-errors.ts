import { AbsenceDateConflictError } from "#/features/absence/errors/absence-date-conflict-error.ts";
import { AbsenceDateInFutureError } from "#/features/absence/errors/absence-date-in-future-error.ts";
import { AbsenceNotFoundError } from "#/features/absence/errors/absence-not-found-error.ts";
import { RoutineNotFoundError } from "#/shared/errors/routine-not-found-error.ts";

/**
 * The Wire errors that `absence.edit` fails with.
 */
export const ABSENCE_EDIT_WIRE_ERRORS = [
  AbsenceDateConflictError,
  AbsenceDateInFutureError,
  AbsenceNotFoundError,
  RoutineNotFoundError,
];
