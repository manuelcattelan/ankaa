import * as Schema from "effect/Schema";

/**
 * The Wire error of a Set recorded, changed or removed in a Workout exercise
 * with a Skip, which keeps the Workout exercise's Sets as they are until it's
 * cleared.
 */
export class SkipConflictError extends Schema.TaggedError<SkipConflictError>()(
  "SkipConflictError",
  {},
) {}
