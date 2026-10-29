import { isAuthenticationRateLimited } from "#/features/authentication/core/is-authentication-rate-limited.ts";
import { AuthenticationError } from "#/shared/errors/authentication-error.ts";

describe("isAuthenticationRateLimited", () => {
  it("returns true for an AuthenticationError with the status 429", () => {
    expect(
      isAuthenticationRateLimited(new AuthenticationError({ status: 429 })),
    ).toBe(true);
  });

  it("returns false for an AuthenticationError with another status", () => {
    expect(
      isAuthenticationRateLimited(new AuthenticationError({ status: 401 })),
    ).toBe(false);
  });

  it("returns false for an error with the status 429 that isn't an AuthenticationError", () => {
    expect(isAuthenticationRateLimited({ status: 429 })).toBe(false);
  });
});
