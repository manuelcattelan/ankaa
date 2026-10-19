import { validateWholeNumber } from "@/shared/core/validate-whole-number";

describe("validateWholeNumber", () => {
  it("accepts the minimum", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        minimum: 1,
        wholeNumberText: "1",
      }),
    ).toEqual({ _tag: "WholeNumberValid" });
  });

  it("accepts a whole number surrounded by spaces", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        minimum: 1,
        wholeNumberText: " 12 ",
      }),
    ).toEqual({ _tag: "WholeNumberValid" });
  });

  it("accepts an empty text when the number isn't required", () => {
    expect(
      validateWholeNumber({
        isRequired: false,
        minimum: 1,
        wholeNumberText: " ",
      }),
    ).toEqual({ _tag: "WholeNumberValid" });
  });

  it("rejects an empty text when the number is required as below the minimum", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        minimum: 1,
        wholeNumberText: "",
      }),
    ).toEqual({ _tag: "WholeNumberBelowMinimum", minimum: 1 });
  });

  it("rejects a number below the minimum", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        minimum: 1,
        wholeNumberText: "0",
      }),
    ).toEqual({ _tag: "WholeNumberBelowMinimum", minimum: 1 });
  });

  it("rejects a decimal number as below the minimum", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        minimum: 1,
        wholeNumberText: "1.5",
      }),
    ).toEqual({ _tag: "WholeNumberBelowMinimum", minimum: 1 });
  });

  it("rejects a negative number as below the minimum", () => {
    expect(
      validateWholeNumber({
        isRequired: false,
        minimum: 0,
        wholeNumberText: "-1",
      }),
    ).toEqual({ _tag: "WholeNumberBelowMinimum", minimum: 0 });
  });

  it("accepts the maximum", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        maximum: 10,
        minimum: 1,
        wholeNumberText: "10",
      }),
    ).toEqual({ _tag: "WholeNumberValid" });
  });

  it("rejects a number above the maximum as out of range", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        maximum: 10,
        minimum: 1,
        wholeNumberText: "11",
      }),
    ).toEqual({ _tag: "WholeNumberOutOfRange", maximum: 10, minimum: 1 });
  });

  it("rejects a number below the minimum as out of range when there's a maximum", () => {
    expect(
      validateWholeNumber({
        isRequired: true,
        maximum: 10,
        minimum: 1,
        wholeNumberText: "0",
      }),
    ).toEqual({ _tag: "WholeNumberOutOfRange", maximum: 10, minimum: 1 });
  });
});
