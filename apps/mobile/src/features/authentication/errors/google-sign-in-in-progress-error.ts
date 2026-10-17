import * as Data from "effect/Data";

export class GoogleSignInInProgressError extends Data.TaggedError(
  "GoogleSignInInProgressError",
) {}
