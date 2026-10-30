import * as Schema from "effect/Schema";

/**
 * The Wire error of a Save whose Routine name another live Routine of the
 * User already has, whatever its case.
 */
export class RoutineNameConflictError extends Schema.TaggedError<RoutineNameConflictError>()(
  "RoutineNameConflictError",
  {},
) {}
