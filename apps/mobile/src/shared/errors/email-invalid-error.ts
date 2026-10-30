import * as Schema from "effect/Schema";

export class EmailInvalidError extends Schema.TaggedError<EmailInvalidError>()(
  "EmailInvalidError",
  {},
) {}
