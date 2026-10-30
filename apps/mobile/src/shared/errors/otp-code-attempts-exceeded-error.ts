import * as Schema from "effect/Schema";

export class OtpCodeAttemptsExceededError extends Schema.TaggedError<OtpCodeAttemptsExceededError>()(
  "OtpCodeAttemptsExceededError",
  {},
) {}
