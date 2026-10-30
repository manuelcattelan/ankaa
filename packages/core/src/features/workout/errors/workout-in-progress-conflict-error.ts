import * as Schema from "effect/Schema";

/**
 * The Wire error of a start while another Workout of the User is in
 * progress.
 */
export class WorkoutInProgressConflictError extends Schema.TaggedError<WorkoutInProgressConflictError>()(
  "WorkoutInProgressConflictError",
  {},
) {}
