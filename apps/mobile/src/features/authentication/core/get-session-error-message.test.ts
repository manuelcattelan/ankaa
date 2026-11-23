import { getSessionErrorMessage } from "#/features/authentication/core/get-session-error-message.ts";

describe("getSessionErrorMessage", () => {
  it("returns no message for a session without an error", () => {
    expect(getSessionErrorMessage({ data: null, error: null })).toBe(null);
  });

  it("returns no message for a session error that comes with an HTTP status", () => {
    const error = {
      message: "Unauthorized",
      status: 401,
      statusText: "Unauthorized",
    };

    expect(getSessionErrorMessage({ data: null, error })).toBe(null);
  });

  it("returns the server unreachable message for a session error that comes with no HTTP status, because the request never reached the server", () => {
    const error = new TypeError("Network request failed");

    expect(getSessionErrorMessage({ data: null, error })).toBe(
      "Ankaa can't connect: check your internet connection and try again.",
    );
  });
});
