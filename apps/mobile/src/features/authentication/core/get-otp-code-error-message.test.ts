import { getOtpCodeErrorMessage } from "#/features/authentication/core/get-otp-code-error-message.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

describe("getOtpCodeErrorMessage", () => {
  it("returns no message without an error", () => {
    expect(
      getOtpCodeErrorMessage({ cooldownRemainingSeconds: 0, error: null }),
    ).toBe(null);
  });

  it("returns the rate limit message with the remaining seconds of the cooldown for a rate-limited error", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: null,
      message: "Authentication failed",
      retryAfterSeconds: 60,
      status: 429,
    });

    expect(
      getOtpCodeErrorMessage({
        cooldownRemainingSeconds: 12,
        error: authenticationClientError,
      }),
    ).toBe("Too many requests: try again in 12 seconds.");
  });

  it("returns no message for a rate-limited error once the cooldown has ended", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: null,
      message: "Authentication failed",
      retryAfterSeconds: 60,
      status: 429,
    });

    expect(
      getOtpCodeErrorMessage({
        cooldownRemainingSeconds: 0,
        error: authenticationClientError,
      }),
    ).toBe(null);
  });

  it("returns the message of the authentication error for an error that isn't rate-limited", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: "OTP_EXPIRED",
      message: "Authentication failed",
      retryAfterSeconds: null,
      status: 400,
    });

    expect(
      getOtpCodeErrorMessage({
        cooldownRemainingSeconds: 0,
        error: authenticationClientError,
      }),
    ).toBe(
      "This verification code has expired: resend the verification code and try again.",
    );
  });
});
