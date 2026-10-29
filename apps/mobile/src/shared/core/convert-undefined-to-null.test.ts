import { convertUndefinedToNull } from "#/shared/core/convert-undefined-to-null.ts";

describe("convertUndefinedToNull", () => {
  it("converts undefined to null", () => {
    expect(convertUndefinedToNull(undefined)).toBe(null);
  });

  it("keeps a value that is defined, even when it's falsy", () => {
    expect(convertUndefinedToNull(0)).toBe(0);
  });
});
