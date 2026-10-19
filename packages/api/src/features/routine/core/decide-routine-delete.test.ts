import { describe, expect, it } from "@effect/vitest";

import { decideRoutineDelete } from "./decide-routine-delete.ts";

describe("decideRoutineDelete", () => {
  it("allows the delete of a Routine that the person owns and hasn't deleted", () => {
    expect(
      decideRoutineDelete({
        routine: { id: "019a0000-0000-7000-8000-000000000001" },
      }),
    ).toEqual({ _tag: "RoutineDeleteAllowed" });
  });

  it("returns RoutineNotFound when the person has no such Routine", () => {
    expect(decideRoutineDelete({ routine: undefined })).toEqual({
      _tag: "RoutineNotFound",
    });
  });
});
