import { getWholeNumberValidationErrorMessage } from "@/shared/core/get-whole-number-validation-error-message";

describe("getWholeNumberValidationErrorMessage", () => {
  it("returns no message for a valid whole number", () => {
    expect(
      getWholeNumberValidationErrorMessage({ _tag: "WholeNumberValid" }),
    ).toBe(undefined);
  });

  it("returns the below minimum message with the minimum for a whole number below the minimum", () => {
    expect(
      getWholeNumberValidationErrorMessage({
        _tag: "WholeNumberBelowMinimum",
        minimum: 1,
      }),
    ).toBe("This number isn't valid: enter a whole number of at least 1.");
  });

  it("returns the out of range message with the minimum and the maximum for a whole number out of range", () => {
    expect(
      getWholeNumberValidationErrorMessage({
        _tag: "WholeNumberOutOfRange",
        maximum: 10,
        minimum: 1,
      }),
    ).toBe("This number isn't valid: enter a whole number from 1 to 10.");
  });
});
