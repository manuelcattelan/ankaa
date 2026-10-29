import { buildAuthenticationClientError } from "#/shared/core/build-authentication-client-error.ts";

describe("buildAuthenticationClientError", () => {
  it("builds an AuthenticationClientError from the code, the message and the status of better-auth's error, and the seconds of its Retry-After header", () => {
    expect(
      buildAuthenticationClientError({
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
          status: 429,
          statusText: "Too Many Requests",
        },
        retryAfterHeader: "30",
      }),
    ).toMatchObject({
      _tag: "AuthenticationClientError",
      cause: null,
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
      retryAfterSeconds: 30,
      status: 429,
    });
  });

  it("builds an AuthenticationClientError without a code, with the status text as its message, when better-auth's error has neither", () => {
    expect(
      buildAuthenticationClientError({
        error: { status: 500, statusText: "Internal Server Error" },
        retryAfterHeader: "30",
      }),
    ).toMatchObject({
      code: null,
      message: "Internal Server Error",
    });
  });

  it("builds an AuthenticationClientError without seconds to retry after when the response has no Retry-After header", () => {
    expect(
      buildAuthenticationClientError({
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
          status: 429,
          statusText: "Too Many Requests",
        },
        retryAfterHeader: null,
      }),
    ).toMatchObject({ retryAfterSeconds: null });
  });
});
