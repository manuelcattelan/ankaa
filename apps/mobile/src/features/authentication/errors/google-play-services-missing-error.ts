import * as Data from "effect/Data";

export class GooglePlayServicesMissingError extends Data.TaggedError(
  "GooglePlayServicesMissingError",
) {}
