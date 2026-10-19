import { getRoutineNameValidationErrorMessage } from "@/features/routine/core/get-routine-name-validation-error-message";

describe("getRoutineNameValidationErrorMessage", () => {
  it("returns no message for a valid name", () => {
    expect(
      getRoutineNameValidationErrorMessage({ _tag: "RoutineNameValid" }),
    ).toBe(undefined);
  });

  it("returns the empty name message for an empty name", () => {
    expect(
      getRoutineNameValidationErrorMessage({ _tag: "RoutineNameEmpty" }),
    ).toBe("This routine has no name: enter a name.");
  });
});
