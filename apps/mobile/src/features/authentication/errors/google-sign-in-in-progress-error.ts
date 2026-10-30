import * as Schema from "effect/Schema";

export class GoogleSignInInProgressError extends Schema.TaggedError<GoogleSignInInProgressError>()(
  "GoogleSignInInProgressError",
  {},
) {}
