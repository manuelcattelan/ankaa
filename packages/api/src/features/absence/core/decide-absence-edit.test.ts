import { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import { AbsenceNotFoundError } from "@ankaa/core/features/absence/errors/absence-not-found-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import * as DateTime from "effect/DateTime";
import { describe, expect, it } from "vitest";

import { decideAbsenceEdit } from "#/features/absence/core/decide-absence-edit.ts";

const SYDNEY_TIME_ZONE = DateTime.zoneMakeNamedUnsafe("Australia/Sydney");

describe("decideAbsenceEdit", () => {
  it("allows a date that is today for a User in Australia/Sydney while it's still the day before in UTC", () => {
    expect(
      decideAbsenceEdit({
        absence: { userId: "user-1" },
        date: "2026-11-02",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-1" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual({ _tag: "AbsenceEditAllowed" });
  });

  it("fails with AbsenceNotFoundError for an Absence that doesn't exist", () => {
    expect(
      decideAbsenceEdit({
        absence: null,
        date: "2026-11-02",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-1" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual(new AbsenceNotFoundError());
  });

  it("fails with AbsenceNotFoundError for an Absence of another User", () => {
    expect(
      decideAbsenceEdit({
        absence: { userId: "user-2" },
        date: "2026-11-02",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-1" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual(new AbsenceNotFoundError());
  });

  it("fails with AbsenceDateInFutureError for the day after today for a User in Australia/Sydney", () => {
    expect(
      decideAbsenceEdit({
        absence: { userId: "user-1" },
        date: "2026-11-03",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-1" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual(new AbsenceDateInFutureError());
  });

  it("fails with RoutineNotFoundError for a Routine the User deleted", () => {
    expect(
      decideAbsenceEdit({
        absence: { userId: "user-1" },
        date: "2026-11-02",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: {
          deletedAt: new Date("2026-10-29T10:00:00.000Z"),
          userId: "user-1",
        },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });
});
