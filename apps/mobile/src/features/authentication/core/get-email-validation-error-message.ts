import * as Match from "effect/Match";

import type { EmailValidationOutcome } from "#/features/authentication/core/validate-email.ts";

import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";

export function getEmailValidationErrorMessage(
  emailValidationOutcome: EmailValidationOutcome,
) {
  return Match.valueTags(emailValidationOutcome, {
    EmailInvalid: () => AUTHENTICATION_MESSAGES.emailInvalidError,
    EmailValid: () => null,
  });
}
