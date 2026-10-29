import { isAuthenticationRateLimited } from "#/features/authentication/core/is-authentication-rate-limited.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

describe("isAuthenticationRateLimited", () => {
  it("returns true for an AuthenticationClientError with the status 429", () => {
    expect(
      isAuthenticationRateLimited(
        new AuthenticationClientError({
          code: null,
          retryAfterSeconds: null,
          status: 429,
        }),
      ),
    ).toBe(true);
  });

  it("returns false for an AuthenticationClientError with another status", () => {
    expect(
      isAuthenticationRateLimited(
        new AuthenticationClientError({
          code: null,
          retryAfterSeconds: null,
          status: 401,
        }),
      ),
    ).toBe(false);
  });

  it("returns false for an error with the status 429 that isn't an AuthenticationClientError", () => {
    expect(isAuthenticationRateLimited({ status: 429 })).toBe(false);
  });
});
