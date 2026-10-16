import * as Schema from "effect/Schema";

const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

const emailFilter = Schema.isPattern(EMAIL_PATTERN);

export function isEmailValid(email: string) {
  return Schema.is(Schema.String.check(emailFilter))(email);
}
