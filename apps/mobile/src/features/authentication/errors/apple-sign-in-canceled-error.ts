import * as Data from "effect/Data";

export class AppleSignInCanceledError extends Data.TaggedError(
  "AppleSignInCanceledError",
) {}
