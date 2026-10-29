import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { urlSchema } from "#/shared/schemas/url-schema.ts";

const decodeUrl = Schema.decodeUnknownSync(urlSchema);

describe("urlSchema", () => {
  it("accepts a valid URL", () => {
    expect(decodeUrl("https://ankaa.app/sign-in")).toBe(
      "https://ankaa.app/sign-in",
    );
  });

  it("accepts a valid URL surrounded by spaces and trims them", () => {
    expect(decodeUrl("  https://ankaa.app/sign-in  ")).toBe(
      "https://ankaa.app/sign-in",
    );
  });

  it("rejects a text that isn't a URL", () => {
    expect(() => decodeUrl("ankaa.app")).toThrow("Expected a valid URL");
  });
});
