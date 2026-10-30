import { describe, expect, it } from "vitest";

import { buildEmailError } from "#/build-email-error.ts";

describe("buildEmailError", () => {
  it("builds an EmailError that keeps the failure of Resend as its cause", () => {
    const resendError = {
      message: "The API key is invalid",
      name: "invalid_api_key",
      statusCode: 403,
    };

    expect(buildEmailError({ cause: resendError })).toMatchObject({
      _tag: "EmailError",
      cause: {
        message: "The API key is invalid",
        name: "invalid_api_key",
        statusCode: 403,
      },
      message: "A request to Resend failed",
    });
  });
});
