import { isWholeNumberValid } from "@/shared/core/is-whole-number-valid";

describe("isWholeNumberValid", () => {
  it("returns true for a valid whole number", () => {
    expect(isWholeNumberValid({ _tag: "WholeNumberValid" })).toBe(true);
  });

  it("returns true for a whole number not validated yet", () => {
    expect(isWholeNumberValid(undefined)).toBe(true);
  });

  it("returns false for a whole number below the minimum", () => {
    expect(
      isWholeNumberValid({ _tag: "WholeNumberBelowMinimum", minimum: 1 }),
    ).toBe(false);
  });

  it("returns false for a whole number out of range", () => {
    expect(
      isWholeNumberValid({
        _tag: "WholeNumberOutOfRange",
        maximum: 10,
        minimum: 1,
      }),
    ).toBe(false);
  });
});
