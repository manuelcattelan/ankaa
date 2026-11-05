import { getGoogleSignInError } from "#/features/authentication/core/get-google-sign-in-error.ts";
import { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";

describe("getGoogleSignInError", () => {
  it("returns a GoogleSignInInProgressError for a failure with the code of a sign-in in progress", () => {
    expect(
      getGoogleSignInError({
        defect: { code: "IN_PROGRESS" },
        inProgressCode: "IN_PROGRESS",
      }),
    ).toStrictEqual(new GoogleSignInInProgressError());
  });

  it("returns null for a failure with another code", () => {
    expect(
      getGoogleSignInError({
        defect: { code: "SIGN_IN_REQUIRED" },
        inProgressCode: "IN_PROGRESS",
      }),
    ).toBeNull();
  });

  it("returns null for a failure without a code", () => {
    expect(
      getGoogleSignInError({
        defect: new Error("Google sign-in failed"),
        inProgressCode: "IN_PROGRESS",
      }),
    ).toBeNull();
  });
});
