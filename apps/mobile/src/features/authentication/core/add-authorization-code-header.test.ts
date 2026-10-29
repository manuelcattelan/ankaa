import { addAuthorizationCodeHeader } from "#/features/authentication/core/add-authorization-code-header.ts";

const FETCH_OPTIONS = { credentials: "omit" };

describe("addAuthorizationCodeHeader", () => {
  it("adds the authorization code of the sign-in as a header", () => {
    expect(
      addAuthorizationCodeHeader({
        authorizationCode: "authorization-code",
        fetchOptions: FETCH_OPTIONS,
      }),
    ).toStrictEqual({
      credentials: "omit",
      headers: { "X-Authorization-Code": "authorization-code" },
    });
  });

  it("leaves the fetch options as they are without an authorization code", () => {
    expect(
      addAuthorizationCodeHeader({
        authorizationCode: null,
        fetchOptions: FETCH_OPTIONS,
      }),
    ).toStrictEqual({ credentials: "omit" });
  });

  it("leaves the fetch options as they are with an empty authorization code", () => {
    expect(
      addAuthorizationCodeHeader({
        authorizationCode: "",
        fetchOptions: FETCH_OPTIONS,
      }),
    ).toStrictEqual({ credentials: "omit" });
  });
});
