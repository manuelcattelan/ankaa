import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

describe("getAuthenticationErrorMessage", () => {
  it("returns the server unreachable message for an AuthenticationClientError caused by a network failure", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: new TypeError("Network request failed"),
      code: null,
      message: "Failed to send the authentication request",
      retryAfterSeconds: null,
      status: null,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });

  it("returns the unknown error message for an AuthenticationClientError caused by an error with a code", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: { code: "ERR_UNEXPECTED" },
      code: null,
      message: "Failed to send the authentication request",
      retryAfterSeconds: null,
      status: null,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the rate limit message with the delay for a rate-limited AuthenticationClientError with a delay", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: null,
      message: "Authentication failed",
      retryAfterSeconds: 30,
      status: 429,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "Too many requests: try again in 30 seconds.",
    );
  });

  it("returns the rate limit message without a delay for a rate-limited AuthenticationClientError without a delay", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: null,
      message: "Authentication failed",
      retryAfterSeconds: null,
      status: 429,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "Too many requests: try again in a moment.",
    );
  });

  it("returns the incorrect verification code message for the code INVALID_OTP", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: "INVALID_OTP",
      message: "Authentication failed",
      retryAfterSeconds: null,
      status: 400,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "This verification code is incorrect: check the verification code in your email and try again.",
    );
  });

  it("returns the account not linked message for the code EMAIL_NOT_VERIFIED", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: "EMAIL_NOT_VERIFIED",
      message: "Authentication failed",
      retryAfterSeconds: null,
      status: 403,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "This account can't be linked with the selected provider: try another sign-in method.",
    );
  });

  it("returns the unknown error message for a code without a message", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: "UNEXPECTED_CODE",
      message: "Authentication failed",
      retryAfterSeconds: null,
      status: 400,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the unknown error message for an AuthenticationClientError without a code", () => {
    const authenticationClientError = new AuthenticationClientError({
      cause: null,
      code: null,
      message: "Authentication failed",
      retryAfterSeconds: null,
      status: 500,
    });

    expect(getAuthenticationErrorMessage(authenticationClientError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the missing Google Play services message for a GooglePlayServicesMissingError", () => {
    expect(
      getAuthenticationErrorMessage(new GooglePlayServicesMissingError()),
    ).toBe(
      "Google Play services aren't installed on this device: try another sign-in method.",
    );
  });

  it("returns an empty message for a GoogleSignInInProgressError", () => {
    expect(
      getAuthenticationErrorMessage(new GoogleSignInInProgressError()),
    ).toBe("");
  });

  it("returns the server unreachable message for another error without a code", () => {
    expect(
      getAuthenticationErrorMessage(new TypeError("Network request failed")),
    ).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });

  it("returns the unknown error message for another error with a code", () => {
    expect(getAuthenticationErrorMessage({ code: "ERR_UNEXPECTED" })).toBe(
      "Something went wrong: try again.",
    );
  });
});
