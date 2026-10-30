import * as Schema from "effect/Schema";

import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";

const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

const emailFilter = Schema.isPattern(EMAIL_PATTERN, {
  message: AUTHENTICATION_MESSAGES.emailInvalidError,
});

export const emailFormSchema = Schema.Struct({
  email: Schema.Trim.check(emailFilter),
});
