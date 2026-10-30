import * as Schema from "effect/Schema";

export class AccountNotLinkedError extends Schema.TaggedError<AccountNotLinkedError>()(
  "AccountNotLinkedError",
  {},
) {}
