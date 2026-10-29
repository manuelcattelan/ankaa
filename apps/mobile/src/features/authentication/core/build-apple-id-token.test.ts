import { buildAppleIdToken } from "#/features/authentication/core/build-apple-id-token.ts";

describe("buildAppleIdToken", () => {
  it("builds the identity token with its nonce when Apple shares no name", () => {
    expect(
      buildAppleIdToken({
        credential: { fullName: null },
        identityToken: "identity-token",
        nonce: "nonce",
      }),
    ).toStrictEqual({ nonce: "nonce", token: "identity-token" });
  });

  it("adds the first and last name that Apple shares", () => {
    expect(
      buildAppleIdToken({
        credential: { fullName: { familyName: "Rossi", givenName: "Anna" } },
        identityToken: "identity-token",
        nonce: "nonce",
      }),
    ).toStrictEqual({
      nonce: "nonce",
      token: "identity-token",
      user: { name: { firstName: "Anna", lastName: "Rossi" } },
    });
  });

  it("adds only the first name when Apple shares no last name", () => {
    expect(
      buildAppleIdToken({
        credential: { fullName: { familyName: null, givenName: "Anna" } },
        identityToken: "identity-token",
        nonce: "nonce",
      }),
    ).toStrictEqual({
      nonce: "nonce",
      token: "identity-token",
      user: { name: { firstName: "Anna" } },
    });
  });

  it("leaves out an empty name", () => {
    expect(
      buildAppleIdToken({
        credential: { fullName: { familyName: null, givenName: "" } },
        identityToken: "identity-token",
        nonce: "nonce",
      }),
    ).toStrictEqual({ nonce: "nonce", token: "identity-token" });
  });
});
