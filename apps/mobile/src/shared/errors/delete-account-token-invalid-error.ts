import * as Schema from "effect/Schema";

export class DeleteAccountTokenInvalidError extends Schema.TaggedError<DeleteAccountTokenInvalidError>()(
  "DeleteAccountTokenInvalidError",
  {},
) {}
