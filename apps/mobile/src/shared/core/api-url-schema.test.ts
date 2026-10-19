import * as Schema from "effect/Schema";

import { apiUrlSchema } from "@/shared/core/api-url-schema";

const decodeApiUrl = Schema.decodeUnknownSync(apiUrlSchema);

describe("apiUrlSchema", () => {
  it("accepts a URL that doesn't end with a slash", () => {
    expect(decodeApiUrl("https://api.ankaa.app")).toBe("https://api.ankaa.app");
  });

  it("rejects a URL that ends with a slash", () => {
    expect(() => decodeApiUrl("https://api.ankaa.app/")).toThrow(
      "Expected a URL that doesn't end with a slash",
    );
  });

  it("rejects a text that isn't a URL", () => {
    expect(() => decodeApiUrl("api.ankaa.app")).toThrow("Expected a valid URL");
  });
});
