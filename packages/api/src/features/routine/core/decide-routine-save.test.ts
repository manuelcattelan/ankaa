import { describe, expect, it } from "@effect/vitest";

import { decideRoutineSave } from "./decide-routine-save.ts";

describe("decideRoutineSave", () => {
  it("allows a new Routine whose name the user doesn't use yet", () => {
    expect(
      decideRoutineSave({
        routineWithSameId: undefined,
        routineWithSameName: undefined,
        userId: "first-user",
      }),
    ).toEqual({ _tag: "RoutineSaveAllowed" });
  });

  it("allows an update of a Routine that the user owns and hasn't deleted", () => {
    expect(
      decideRoutineSave({
        routineWithSameId: { deletedAt: null, userId: "first-user" },
        routineWithSameName: undefined,
        userId: "first-user",
      }),
    ).toEqual({ _tag: "RoutineSaveAllowed" });
  });

  it("returns RoutineNameConflict when another Routine of the user has the same name", () => {
    expect(
      decideRoutineSave({
        routineWithSameId: undefined,
        routineWithSameName: { id: "019a0000-0000-7000-8000-000000000002" },
        userId: "first-user",
      }),
    ).toEqual({ _tag: "RoutineNameConflict" });
  });

  it("returns RoutineNotFound when the Routine belongs to another user", () => {
    expect(
      decideRoutineSave({
        routineWithSameId: { deletedAt: null, userId: "second-user" },
        routineWithSameName: undefined,
        userId: "first-user",
      }),
    ).toEqual({ _tag: "RoutineNotFound" });
  });

  it("returns RoutineNotFound when the user has deleted the Routine", () => {
    expect(
      decideRoutineSave({
        routineWithSameId: {
          deletedAt: new Date("2026-10-19T09:00:00.000Z"),
          userId: "first-user",
        },
        routineWithSameName: undefined,
        userId: "first-user",
      }),
    ).toEqual({ _tag: "RoutineNotFound" });
  });
});
