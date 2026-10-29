import { getOtpCodeCompletenessValidationErrorMessage } from "#/features/authentication/core/get-otp-code-completeness-validation-error-message.ts";

describe("getOtpCodeCompletenessValidationErrorMessage", () => {
  it("returns no message for a complete OTP code", () => {
    expect(
      getOtpCodeCompletenessValidationErrorMessage({
        _tag: "OtpCodeCompletenessValid",
      }),
    ).toBe(null);
  });

  it("returns the incomplete verification code message with the number of digits for an incomplete OTP code", () => {
    expect(
      getOtpCodeCompletenessValidationErrorMessage({
        _tag: "OtpCodeIncomplete",
      }),
    ).toBe("This verification code is incomplete: enter all 6 digits.");
  });
});
