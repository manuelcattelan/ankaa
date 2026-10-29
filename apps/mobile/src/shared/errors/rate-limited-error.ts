import * as Schema from "effect/Schema";

export class RateLimitedError extends Schema.TaggedError<RateLimitedError>()(
  "RateLimitedError",
  { retryAfterSeconds: Schema.NullOr(Schema.Number) },
) {}
