import * as Schema from "effect/Schema";

export class AuthenticationError extends Schema.TaggedError<AuthenticationError>()(
  "AuthenticationError",
  { cause: Schema.Defect() },
) {}
