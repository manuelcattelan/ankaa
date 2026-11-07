import { isAccessibilityCategory } from "#/shared/core/is-accessibility-category.ts";

describe("isAccessibilityCategory", () => {
  it("is true at AX1", () => {
    expect(isAccessibilityCategory(1.786)).toBe(true);
  });

  it("is false at xxxLarge, the text size just below AX1", () => {
    expect(isAccessibilityCategory(1.353)).toBe(false);
  });
});
