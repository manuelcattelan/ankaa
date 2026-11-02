import * as Schema from "effect/Schema";

/**
 * The Wire error of an Absence for a Routine and a date that already have
 * one.
 */
export class AbsenceDateConflictError extends Schema.TaggedError<AbsenceDateConflictError>()(
  "AbsenceDateConflictError",
  {},
) {}
