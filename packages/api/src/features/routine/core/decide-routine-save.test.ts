import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { describe, expect, it } from "vitest";

import { decideRoutineSave } from "#/features/routine/core/decide-routine-save.ts";

describe("decideRoutineSave", () => {
  it("allows the Save of a Routine that doesn't exist yet", () => {
    expect(
      decideRoutineSave({ routine: null, userId: "user-1" }),
    ).toStrictEqual({ _tag: "RoutineSaveAllowed" });
  });

  it("allows the Save of a live Routine of the User", () => {
    expect(
      decideRoutineSave({
        routine: { deletedAt: null, userId: "user-1" },
        userId: "user-1",
      }),
    ).toStrictEqual({ _tag: "RoutineSaveAllowed" });
  });

  it("fails with RoutineNotFoundError for a Routine of another User", () => {
    expect(
      decideRoutineSave({
        routine: { deletedAt: null, userId: "user-2" },
        userId: "user-1",
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });

  it("fails with RoutineNotFoundError for a Routine the User deleted", () => {
    expect(
      decideRoutineSave({
        routine: {
          deletedAt: new Date("2026-10-29T10:00:00.000Z"),
          userId: "user-1",
        },
        userId: "user-1",
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });
});
