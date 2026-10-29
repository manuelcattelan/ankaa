import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import { AccountNotLinkedError } from "#/shared/errors/account-not-linked-error.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";
import { DeleteAccountTokenInvalidError } from "#/shared/errors/delete-account-token-invalid-error.ts";
import { EmailInvalidError } from "#/shared/errors/email-invalid-error.ts";
import { EmailNotSharedError } from "#/shared/errors/email-not-shared-error.ts";
import { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";

describe("getAuthenticationErrorMessage", () => {
  it("returns the server unreachable message for an AuthenticationClientError", () => {
    expect(
      getAuthenticationErrorMessage(
        new AuthenticationClientError({
          cause: new TypeError("Network request failed"),
        }),
      ),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });

  it("returns the rate limit message with the seconds to wait for a RateLimitedError with seconds", () => {
    expect(
      getAuthenticationErrorMessage(
        new RateLimitedError({ retryAfterSeconds: 30 }),
      ),
    ).toBe("Too many requests: try again in 30 seconds.");
  });

  it("returns the rate limit message without a delay for a RateLimitedError without seconds", () => {
    expect(
      getAuthenticationErrorMessage(
        new RateLimitedError({ retryAfterSeconds: null }),
      ),
    ).toBe("Too many requests: try again in a moment.");
  });

  it("returns the incorrect verification code message for an OtpCodeInvalidError", () => {
    expect(getAuthenticationErrorMessage(new OtpCodeInvalidError())).toBe(
      "This verification code is incorrect: check the verification code in your email and try again.",
    );
  });

  it("returns the expired verification code message, which says to request a new one, for an OtpCodeExpiredError", () => {
    expect(getAuthenticationErrorMessage(new OtpCodeExpiredError())).toBe(
      "This verification code has expired: resend the verification code and try again.",
    );
  });

  it("returns the too many attempts message, which says to request a new verification code, for an OtpCodeAttemptsExceededError", () => {
    expect(
      getAuthenticationErrorMessage(new OtpCodeAttemptsExceededError()),
    ).toBe(
      "Too many incorrect attempts: resend the verification code and try again.",
    );
  });

  it("returns the dead link message, which says to tap Delete account for a new link, for a DeleteAccountTokenInvalidError", () => {
    expect(
      getAuthenticationErrorMessage(new DeleteAccountTokenInvalidError()),
    ).toBe(
      "This link has expired or was already used. Tap Delete account to get a new one.",
    );
  });

  it("returns the invalid email address message for an EmailInvalidError", () => {
    expect(getAuthenticationErrorMessage(new EmailInvalidError())).toBe(
      "This email address isn't valid: enter an address like name@example.com.",
    );
  });

  it("returns the account not linked message for an AccountNotLinkedError", () => {
    expect(getAuthenticationErrorMessage(new AccountNotLinkedError())).toBe(
      "This account can't be linked with the selected provider: try another sign-in method.",
    );
  });

  it("returns the email not shared message for an EmailNotSharedError", () => {
    expect(getAuthenticationErrorMessage(new EmailNotSharedError())).toBe(
      "The selected provider didn't share your email address: try another sign-in method.",
    );
  });

  it("returns the missing Google Play services message for a GooglePlayServicesMissingError", () => {
    expect(
      getAuthenticationErrorMessage(new GooglePlayServicesMissingError()),
    ).toBe(
      "Google Play services aren't installed on this device: try another sign-in method.",
    );
  });

  it("returns the unknown error message for a defect", () => {
    expect(
      getAuthenticationErrorMessage({
        code: "FAILED_TO_CREATE_USER",
        status: 422,
      }),
    ).toBe("Something went wrong: try again.");
  });
});
