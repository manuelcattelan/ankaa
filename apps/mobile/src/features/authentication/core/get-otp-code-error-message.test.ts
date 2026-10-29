import { getOtpCodeErrorMessage } from "#/features/authentication/core/get-otp-code-error-message.ts";
import { AuthenticationError } from "#/shared/errors/authentication-error.ts";

describe("getOtpCodeErrorMessage", () => {
  it("returns no message without an error", () => {
    expect(
      getOtpCodeErrorMessage({ cooldownRemainingSeconds: 0, error: undefined }),
    ).toBe(undefined);
  });

  it("returns the rate limit message with the remaining seconds of the cooldown for a rate-limited error", () => {
    const authenticationError = new AuthenticationError({
      retryAfterSeconds: 60,
      status: 429,
    });

    expect(
      getOtpCodeErrorMessage({
        cooldownRemainingSeconds: 12,
        error: authenticationError,
      }),
    ).toBe("Too many requests: try again in 12 seconds.");
  });

  it("returns no message for a rate-limited error once the cooldown has ended", () => {
    const authenticationError = new AuthenticationError({
      retryAfterSeconds: 60,
      status: 429,
    });

    expect(
      getOtpCodeErrorMessage({
        cooldownRemainingSeconds: 0,
        error: authenticationError,
      }),
    ).toBe(undefined);
  });

  it("returns the message of the authentication error for an error that isn't rate-limited", () => {
    const authenticationError = new AuthenticationError({
      code: "OTP_EXPIRED",
      status: 400,
    });

    expect(
      getOtpCodeErrorMessage({
        cooldownRemainingSeconds: 0,
        error: authenticationError,
      }),
    ).toBe(
      "This verification code has expired: resend the verification code and try again.",
    );
  });
});
