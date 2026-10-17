import * as Match from "effect/Match";

import type { EmailValidationOutcome } from "@/features/authentication/core/validate-email";

import { authenticationErrorMessages } from "@/features/authentication/messages/authentication-error-messages";

export function getEmailValidationErrorMessage(
  emailValidationOutcome: EmailValidationOutcome,
) {
  return Match.valueTags(emailValidationOutcome, {
    EmailInvalid: () => authenticationErrorMessages.emailInvalid,
    EmailValid: () => undefined,
  });
}
