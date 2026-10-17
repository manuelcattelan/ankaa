import * as Data from "effect/Data";

export class WorkoutNotFoundError extends Data.TaggedError(
  "WorkoutNotFoundError",
) {}
