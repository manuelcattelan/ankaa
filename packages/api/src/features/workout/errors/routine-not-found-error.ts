import * as Data from "effect/Data";

export class RoutineNotFoundError extends Data.TaggedError(
  "RoutineNotFoundError",
) {}
