import * as Schema from "effect/Schema";

export class OtpCodeExpiredError extends Schema.TaggedError<OtpCodeExpiredError>()(
  "OtpCodeExpiredError",
  {},
) {}
