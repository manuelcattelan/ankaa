import * as Schema from "effect/Schema";

export class EmailNotSharedError extends Schema.TaggedError<EmailNotSharedError>()(
  "EmailNotSharedError",
  {},
) {}
