import * as Schema from "effect/Schema";

export class OtpCodeInvalidError extends Schema.TaggedError<OtpCodeInvalidError>()(
  "OtpCodeInvalidError",
  {},
) {}
