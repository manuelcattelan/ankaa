import { getAuthenticationResponseError } from "#/shared/core/get-authentication-response-error.ts";
import { AccountNotLinkedError } from "#/shared/errors/account-not-linked-error.ts";
import { EmailInvalidError } from "#/shared/errors/email-invalid-error.ts";
import { EmailNotSharedError } from "#/shared/errors/email-not-shared-error.ts";
import { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";

describe("getAuthenticationResponseError", () => {
  it("returns a RateLimitedError with the seconds of the X-Retry-After header for a response with status 429", () => {
    expect(
      getAuthenticationResponseError({
        code: null,
        retryAfterHeader: "30",
        status: 429,
      }),
    ).toStrictEqual(new RateLimitedError({ retryAfterSeconds: 30 }));
  });

  it("returns a RateLimitedError without seconds for a response with status 429 whose X-Retry-After header isn't a number of seconds", () => {
    expect(
      getAuthenticationResponseError({
        code: null,
        retryAfterHeader: "soon",
        status: 429,
      }),
    ).toStrictEqual(new RateLimitedError({ retryAfterSeconds: null }));
  });

  it("returns a RateLimitedError without seconds for a response with status 429 and no X-Retry-After header", () => {
    expect(
      getAuthenticationResponseError({
        code: null,
        retryAfterHeader: null,
        status: 429,
      }),
    ).toStrictEqual(new RateLimitedError({ retryAfterSeconds: null }));
  });

  it("returns an OtpCodeInvalidError for the code INVALID_OTP", () => {
    expect(
      getAuthenticationResponseError({
        code: "INVALID_OTP",
        retryAfterHeader: null,
        status: 400,
      }),
    ).toStrictEqual(new OtpCodeInvalidError());
  });

  it("returns an OtpCodeExpiredError for the code OTP_EXPIRED", () => {
    expect(
      getAuthenticationResponseError({
        code: "OTP_EXPIRED",
        retryAfterHeader: null,
        status: 400,
      }),
    ).toStrictEqual(new OtpCodeExpiredError());
  });

  it("returns an OtpCodeAttemptsExceededError for the code TOO_MANY_ATTEMPTS", () => {
    expect(
      getAuthenticationResponseError({
        code: "TOO_MANY_ATTEMPTS",
        retryAfterHeader: null,
        status: 403,
      }),
    ).toStrictEqual(new OtpCodeAttemptsExceededError());
  });

  it("returns an EmailInvalidError for the code INVALID_EMAIL", () => {
    expect(
      getAuthenticationResponseError({
        code: "INVALID_EMAIL",
        retryAfterHeader: null,
        status: 400,
      }),
    ).toStrictEqual(new EmailInvalidError());
  });

  it("returns an AccountNotLinkedError for the code OAUTH_LINK_ERROR", () => {
    expect(
      getAuthenticationResponseError({
        code: "OAUTH_LINK_ERROR",
        retryAfterHeader: null,
        status: 401,
      }),
    ).toStrictEqual(new AccountNotLinkedError());
  });

  it("returns an AccountNotLinkedError for the code EMAIL_NOT_VERIFIED", () => {
    expect(
      getAuthenticationResponseError({
        code: "EMAIL_NOT_VERIFIED",
        retryAfterHeader: null,
        status: 403,
      }),
    ).toStrictEqual(new AccountNotLinkedError());
  });

  it("returns an EmailNotSharedError for the code USER_EMAIL_NOT_FOUND", () => {
    expect(
      getAuthenticationResponseError({
        code: "USER_EMAIL_NOT_FOUND",
        retryAfterHeader: null,
        status: 401,
      }),
    ).toStrictEqual(new EmailNotSharedError());
  });

  it("returns null for a code that no screen acts on", () => {
    expect(
      getAuthenticationResponseError({
        code: "FAILED_TO_CREATE_USER",
        retryAfterHeader: null,
        status: 422,
      }),
    ).toBe(null);
  });
});
