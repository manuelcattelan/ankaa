import { parseOptionalWholeNumber } from "@/shared/core/parse-optional-whole-number";

describe("parseOptionalWholeNumber", () => {
  it("parses a whole number surrounded by spaces", () => {
    expect(parseOptionalWholeNumber(" 12 ")).toBe(12);
  });

  it("parses 0 as a number", () => {
    expect(parseOptionalWholeNumber("0")).toBe(0);
  });

  it("returns null for a text of only spaces", () => {
    expect(parseOptionalWholeNumber("  ")).toBe(null);
  });

  it("returns null for no text", () => {
    expect(parseOptionalWholeNumber(undefined)).toBe(null);
  });
});
