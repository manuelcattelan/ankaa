import * as Schema from "effect/Schema";

/**
 * The Wire error of a call about a Routine that doesn't exist, or that
 * another User owns.
 */
export class RoutineNotFoundError extends Schema.TaggedError<RoutineNotFoundError>()(
  "RoutineNotFoundError",
  {},
) {}
