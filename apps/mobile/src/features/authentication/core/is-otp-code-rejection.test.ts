import { isOtpCodeRejection } from "#/features/authentication/core/is-otp-code-rejection.ts";
import { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";

describe("isOtpCodeRejection", () => {
  it("returns true for an incorrect verification code", () => {
    expect(isOtpCodeRejection(new OtpCodeInvalidError())).toBe(true);
  });

  it("returns true for an expired verification code", () => {
    expect(isOtpCodeRejection(new OtpCodeExpiredError())).toBe(true);
  });

  it("returns true for too many incorrect attempts", () => {
    expect(isOtpCodeRejection(new OtpCodeAttemptsExceededError())).toBe(true);
  });

  it("returns false for a rate-limited request", () => {
    expect(
      isOtpCodeRejection(new RateLimitedError({ retryAfterSeconds: 30 })),
    ).toBe(false);
  });
});
