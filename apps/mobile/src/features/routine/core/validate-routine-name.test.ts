import { validateRoutineName } from "@/features/routine/core/validate-routine-name";

describe("validateRoutineName", () => {
  it("accepts a name of one character", () => {
    expect(validateRoutineName("A")).toEqual({ _tag: "RoutineNameValid" });
  });

  it("rejects an empty name as empty", () => {
    expect(validateRoutineName("")).toEqual({ _tag: "RoutineNameEmpty" });
  });

  it("rejects a name of only spaces as empty", () => {
    expect(validateRoutineName("   ")).toEqual({ _tag: "RoutineNameEmpty" });
  });
});
