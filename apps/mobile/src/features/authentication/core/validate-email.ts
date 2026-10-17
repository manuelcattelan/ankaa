import * as Data from "effect/Data";
import * as Schema from "effect/Schema";

export type EmailValidationOutcome = Data.TaggedEnum<{
  EmailInvalid: object;
  EmailValid: object;
}>;

const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

const emailFilter = Schema.isPattern(EMAIL_PATTERN);

const EmailValidationOutcome = Data.taggedEnum<EmailValidationOutcome>();

export function validateEmail(email: string) {
  return Schema.is(Schema.String.check(emailFilter))(email)
    ? EmailValidationOutcome.EmailValid()
    : EmailValidationOutcome.EmailInvalid();
}
