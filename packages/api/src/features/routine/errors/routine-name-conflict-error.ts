import * as Data from "effect/Data";

export class RoutineNameConflictError extends Data.TaggedError(
  "RoutineNameConflictError",
) {}
