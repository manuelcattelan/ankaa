import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { describe, expect, it } from "vitest";

import { decideRoutineDelete } from "#/features/routine/core/decide-routine-delete.ts";

describe("decideRoutineDelete", () => {
  it("allows the delete of a live Routine of the User", () => {
    expect(
      decideRoutineDelete({
        routine: { deletedAt: null, userId: "user-1" },
        userId: "user-1",
      }),
    ).toStrictEqual({ _tag: "RoutineDeleteAllowed" });
  });

  it("decides that a Routine the User already deleted needs no delete", () => {
    expect(
      decideRoutineDelete({
        routine: {
          deletedAt: new Date("2026-10-29T10:00:00.000Z"),
          userId: "user-1",
        },
        userId: "user-1",
      }),
    ).toStrictEqual({ _tag: "RoutineAlreadyDeleted" });
  });

  it("fails with RoutineNotFoundError for a Routine that doesn't exist", () => {
    expect(
      decideRoutineDelete({ routine: null, userId: "user-1" }),
    ).toStrictEqual(new RoutineNotFoundError());
  });

  it("fails with RoutineNotFoundError for a Routine of another User", () => {
    expect(
      decideRoutineDelete({
        routine: { deletedAt: null, userId: "user-2" },
        userId: "user-1",
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });
});
