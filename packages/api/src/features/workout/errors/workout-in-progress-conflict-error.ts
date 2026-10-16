import * as Data from "effect/Data";

export class WorkoutInProgressConflictError extends Data.TaggedError(
  "WorkoutInProgressConflictError",
) {}
