import * as Schema from "effect/Schema";

export class GoogleSignInCanceledError extends Schema.TaggedError<GoogleSignInCanceledError>()(
  "GoogleSignInCanceledError",
  {},
) {}
