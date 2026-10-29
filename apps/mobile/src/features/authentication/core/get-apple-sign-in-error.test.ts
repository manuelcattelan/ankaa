import { getAppleSignInError } from "#/features/authentication/core/get-apple-sign-in-error.ts";
import { AppleSignInCanceledError } from "#/features/authentication/errors/apple-sign-in-canceled-error.ts";

describe("getAppleSignInError", () => {
  it("returns an AppleSignInCanceledError for a failure with the code ERR_REQUEST_CANCELED", () => {
    expect(getAppleSignInError({ code: "ERR_REQUEST_CANCELED" })).toStrictEqual(
      new AppleSignInCanceledError(),
    );
  });

  it("returns null for a failure with another code", () => {
    expect(getAppleSignInError({ code: "ERR_REQUEST_FAILED" })).toBeNull();
  });

  it("returns null for a failure without a code", () => {
    expect(getAppleSignInError(new Error("Apple sign-in failed"))).toBeNull();
  });
});
