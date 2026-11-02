import { AbsenceNotFoundError } from "#/features/absence/errors/absence-not-found-error.ts";

/**
 * The Wire errors that `absence.remove` fails with.
 */
export const ABSENCE_REMOVE_WIRE_ERRORS = [AbsenceNotFoundError];
