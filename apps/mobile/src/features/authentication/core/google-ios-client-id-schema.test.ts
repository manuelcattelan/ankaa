import * as Schema from "effect/Schema";

import { googleIosClientIdSchema } from "#/features/authentication/core/google-ios-client-id-schema.ts";

const decodeGoogleIosClientId = Schema.decodeUnknownSync(
  googleIosClientIdSchema,
);

describe("googleIosClientIdSchema", () => {
  it("accepts a client ID that ends with .apps.googleusercontent.com", () => {
    expect(
      decodeGoogleIosClientId("1234-abcd.apps.googleusercontent.com"),
    ).toBe("1234-abcd.apps.googleusercontent.com");
  });

  it("rejects a client ID that doesn't end with .apps.googleusercontent.com", () => {
    expect(() => decodeGoogleIosClientId("1234-abcd")).toThrow(
      String.raw`Expected a string matching the RegExp ^.+\.apps\.googleusercontent\.com$`,
    );
  });
});
