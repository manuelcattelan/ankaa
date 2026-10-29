import { getEmailValidationErrorMessage } from "#/features/authentication/core/get-email-validation-error-message.ts";

describe("getEmailValidationErrorMessage", () => {
  it("returns no message for a valid email address", () => {
    expect(getEmailValidationErrorMessage({ _tag: "EmailValid" })).toBe(null);
  });

  it("returns the invalid email address message for an invalid email address", () => {
    expect(getEmailValidationErrorMessage({ _tag: "EmailInvalid" })).toBe(
      "This email address isn't valid: enter an address like name@example.com.",
    );
  });
});
