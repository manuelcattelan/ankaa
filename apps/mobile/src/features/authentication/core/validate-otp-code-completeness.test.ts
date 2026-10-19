import { validateOtpCodeCompleteness } from "@/features/authentication/core/validate-otp-code-completeness";

describe("validateOtpCodeCompleteness", () => {
  it("accepts an OTP code of 6 digits as complete", () => {
    expect(validateOtpCodeCompleteness("123456")).toEqual({
      _tag: "OtpCodeCompletenessValid",
    });
  });

  it("rejects an OTP code of 5 digits as incomplete", () => {
    expect(validateOtpCodeCompleteness("12345")).toEqual({
      _tag: "OtpCodeIncomplete",
    });
  });

  it("rejects an empty OTP code as incomplete", () => {
    expect(validateOtpCodeCompleteness("")).toEqual({
      _tag: "OtpCodeIncomplete",
    });
  });
});
