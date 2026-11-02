import { AbsenceNotFoundError } from "@ankaa/core/features/absence/errors/absence-not-found-error";
import { describe, expect, it } from "vitest";

import { decideAbsenceRemove } from "#/features/absence/core/decide-absence-remove.ts";

describe("decideAbsenceRemove", () => {
  it("allows removing an Absence of the User", () => {
    expect(
      decideAbsenceRemove({ absence: { userId: "user-1" }, userId: "user-1" }),
    ).toStrictEqual({ _tag: "AbsenceRemoveAllowed" });
  });

  it("writes nothing for an Absence that no longer exists", () => {
    expect(
      decideAbsenceRemove({ absence: null, userId: "user-1" }),
    ).toStrictEqual({ _tag: "AbsenceAlreadyRemoved" });
  });

  it("fails with AbsenceNotFoundError for an Absence of another User", () => {
    expect(
      decideAbsenceRemove({ absence: { userId: "user-2" }, userId: "user-1" }),
    ).toStrictEqual(new AbsenceNotFoundError());
  });
});
