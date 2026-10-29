import * as Schema from "effect/Schema";

export class AppleSignInCanceledError extends Schema.TaggedError<AppleSignInCanceledError>()(
  "AppleSignInCanceledError",
  {},
) {}
