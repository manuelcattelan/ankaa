import { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import * as DateTime from "effect/DateTime";
import { describe, expect, it } from "vitest";

import { decideAbsenceRecord } from "#/features/absence/core/decide-absence-record.ts";

const SYDNEY_TIME_ZONE = DateTime.zoneMakeNamedUnsafe("Australia/Sydney");

describe("decideAbsenceRecord", () => {
  it("allows a date that is today for a User in Australia/Sydney while it's still the day before in UTC", () => {
    expect(
      decideAbsenceRecord({
        date: "2026-11-02",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-1" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual({ _tag: "AbsenceRecordAllowed" });
  });

  it("fails with AbsenceDateInFutureError for the day after today for a User in Australia/Sydney", () => {
    expect(
      decideAbsenceRecord({
        date: "2026-11-03",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-1" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual(new AbsenceDateInFutureError());
  });

  it("allows a date in the past", () => {
    expect(
      decideAbsenceRecord({
        date: "2026-10-15",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-1" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual({ _tag: "AbsenceRecordAllowed" });
  });

  it("fails with RoutineNotFoundError for a Routine that doesn't exist", () => {
    expect(
      decideAbsenceRecord({
        date: "2026-11-02",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: null,
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });

  it("fails with RoutineNotFoundError for a Routine of another User", () => {
    expect(
      decideAbsenceRecord({
        date: "2026-11-02",
        now: DateTime.makeUnsafe("2026-11-01T20:00:00.000Z"),
        routine: { deletedAt: null, userId: "user-2" },
        timeZone: SYDNEY_TIME_ZONE,
        userId: "user-1",
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });

  it("fails with RoutineNotFoundError for a Routine the User deleted", () => {
    expect(
      decideAbsenceRecord({
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
