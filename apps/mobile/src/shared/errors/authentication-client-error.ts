import * as Schema from "effect/Schema";

export class AuthenticationClientError extends Schema.TaggedError<AuthenticationClientError>()(
  "AuthenticationClientError",
  {
    cause: Schema.NullOr(Schema.Defect()),
    code: Schema.NullOr(Schema.String),
    message: Schema.String,
    retryAfterSeconds: Schema.NullOr(Schema.Number),
    status: Schema.NullOr(Schema.Number),
  },
) {}
