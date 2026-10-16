import * as Data from "effect/Data";

export class GoogleSignInCanceledError extends Data.TaggedError(
  "GoogleSignInCanceledError",
) {}
