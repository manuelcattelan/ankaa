import { describe, expect, it } from "vitest";

import { buildEmailError } from "#/core/build-email-error.ts";

describe("buildEmailError", () => {
  it("builds an EmailError that names the subject of the email and keeps the failure of Resend as its cause", () => {
    const resendError = {
      message: "The API key is invalid",
      name: "invalid_api_key",
      statusCode: 403,
    };

    expect(
      buildEmailError({
        cause: resendError,
        subject: "Your sign-in verification code",
      }),
    ).toMatchObject({
      _tag: "EmailError",
      cause: {
        message: "The API key is invalid",
        name: "invalid_api_key",
        statusCode: 403,
      },
      message:
        'Failed to send email with subject "Your sign-in verification code"',
    });
  });
});
