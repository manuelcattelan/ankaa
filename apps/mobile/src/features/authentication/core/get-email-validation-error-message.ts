import * as Match from "effect/Match";

import type { EmailValidationOutcome } from "#/features/authentication/core/validate-email.ts";

import { AUTHENTICATION_ERROR_MESSAGES } from "#/features/authentication/messages/authentication-error-messages.ts";

export function getEmailValidationErrorMessage(
  emailValidationOutcome: EmailValidationOutcome,
) {
  return Match.valueTags(emailValidationOutcome, {
    EmailInvalid: () => AUTHENTICATION_ERROR_MESSAGES.emailInvalid,
    EmailValid: () => undefined,
  });
}
