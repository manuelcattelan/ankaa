import { getSessionErrorMessage } from "@/features/authentication/core/get-session-error-message";

const AUTHENTICATION_SESSION = {
  data: null,
  error: null,
  isPending: false,
  isRefetching: false,
  refetch: () => Promise.resolve(),
};

describe("getSessionErrorMessage", () => {
  it("returns no message for a session without an error", () => {
    expect(getSessionErrorMessage(AUTHENTICATION_SESSION)).toBe(undefined);
  });

  it("returns no message for a session error that comes with an HTTP status", () => {
    const authenticationSession = {
      ...AUTHENTICATION_SESSION,
      error: {
        error: undefined,
        message: "Unauthorized",
        name: "BetterFetchError",
        status: 401,
        statusText: "Unauthorized",
      },
    };

    expect(getSessionErrorMessage(authenticationSession)).toBe(undefined);
  });
});
