import * as Schema from "effect/Schema";

/**
 * The Wire error of a call about a Workout that doesn't exist, that another
 * User owns, or that the User already stopped.
 */
export class WorkoutNotFoundError extends Schema.TaggedError<WorkoutNotFoundError>()(
  "WorkoutNotFoundError",
  {},
) {}
