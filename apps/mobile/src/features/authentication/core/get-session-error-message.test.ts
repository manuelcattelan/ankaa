import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";

import { getSessionErrorMessage } from "#/features/authentication/core/get-session-error-message.ts";

type AuthenticationSession = ReturnType<
  AuthenticationClient["Service"]["authClient"]["useSession"]
>;

const AUTHENTICATION_SESSION: AuthenticationSession = {
  data: null,
  error: null,
  isPending: false,
  isRefetching: false,
  refetch: () => Promise.resolve(),
};

describe("getSessionErrorMessage", () => {
  it("returns no message for a session without an error", () => {
    expect(getSessionErrorMessage(AUTHENTICATION_SESSION)).toBe(null);
  });

  it("returns no message for a session error that comes with an HTTP status", () => {
    const authenticationSession = {
      ...AUTHENTICATION_SESSION,
      error: {
        error: null,
        message: "Unauthorized",
        name: "BetterFetchError",
        status: 401,
        statusText: "Unauthorized",
      },
    };

    expect(getSessionErrorMessage(authenticationSession)).toBe(null);
  });

  it("returns the server unreachable message for a session error that comes with no HTTP status, because the request never reached the server", () => {
    const error = {
      error: null,
      message: "Network request failed",
      name: "TypeError",
      status: 0,
      statusText: "",
    };
    Reflect.deleteProperty(error, "status");

    expect(getSessionErrorMessage({ ...AUTHENTICATION_SESSION, error })).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
