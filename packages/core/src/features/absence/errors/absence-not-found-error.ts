import * as Schema from "effect/Schema";

/**
 * The Wire error of a call about an Absence that doesn't exist or that
 * another User owns.
 */
export class AbsenceNotFoundError extends Schema.TaggedError<AbsenceNotFoundError>()(
  "AbsenceNotFoundError",
  {},
) {}
