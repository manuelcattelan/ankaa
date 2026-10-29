import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";
import { GooglePlayServicesMissingError } from "@/features/authentication/errors/google-play-services-missing-error";
import { GoogleSignInInProgressError } from "@/features/authentication/errors/google-sign-in-in-progress-error";
import { AuthenticationError } from "@/shared/errors/authentication-error";

describe("getAuthenticationErrorMessage", () => {
  it("returns the server unreachable message for an AuthenticationError caused by a network failure", () => {
    const authenticationError = new AuthenticationError({
      cause: new TypeError("Network request failed"),
    });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });

  it("returns the unknown error message for an AuthenticationError caused by an error with a code", () => {
    const authenticationError = new AuthenticationError({
      cause: { code: "ERR_UNEXPECTED" },
    });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the rate limit message with the delay for a rate-limited AuthenticationError with a delay", () => {
    const authenticationError = new AuthenticationError({
      retryAfterSeconds: 30,
      status: 429,
    });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
      "Too many requests: try again in 30 seconds.",
    );
  });

  it("returns the rate limit message without a delay for a rate-limited AuthenticationError without a delay", () => {
    const authenticationError = new AuthenticationError({ status: 429 });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
      "Too many requests: try again in a moment.",
    );
  });

  it("returns the incorrect verification code message for the code INVALID_OTP", () => {
    const authenticationError = new AuthenticationError({
      code: "INVALID_OTP",
      status: 400,
    });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
      "This verification code is incorrect: check the verification code in your email and try again.",
    );
  });

  it("returns the account not linked message for the code EMAIL_NOT_VERIFIED", () => {
    const authenticationError = new AuthenticationError({
      code: "EMAIL_NOT_VERIFIED",
      status: 403,
    });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
      "This account can't be linked with the selected provider: try another sign-in method.",
    );
  });

  it("returns the unknown error message for a code without a message", () => {
    const authenticationError = new AuthenticationError({
      code: "UNEXPECTED_CODE",
      status: 400,
    });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
      "Something went wrong: try again.",
    );
  });

  it("returns the unknown error message for an AuthenticationError without a code", () => {
    const authenticationError = new AuthenticationError({ status: 500 });

    expect(getAuthenticationErrorMessage(authenticationError)).toBe(
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
