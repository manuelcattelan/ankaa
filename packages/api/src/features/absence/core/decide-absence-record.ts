import { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import { createNotFutureDateFilter } from "@ankaa/core/features/absence/filters/create-not-future-date-filter";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import * as DateTime from "effect/DateTime";
import * as Schema from "effect/Schema";

/**
 * Decides whether an Absence may be recorded on `date`, given the Routine it
 * records, or `null` when none has its id. The Routine must be a live one of
 * the User, and the date mustn't be after today in `timeZone`, the zone of
 * the User's device, because the server's own clock knows only UTC, and a
 * User in Sydney records "today" before UTC reaches it.
 */
export function decideAbsenceRecord({
  date,
  now,
  routine,
  timeZone,
  userId,
}: {
  date: string;
  now: DateTime.Utc;
  routine: null | { deletedAt: Date | null; userId: string };
  timeZone: DateTime.TimeZone;
  userId: string;
}) {
  if (routine?.userId !== userId || routine.deletedAt !== null) {
    return new RoutineNotFoundError();
  }

  const today = DateTime.formatIsoDate(DateTime.setZone(now, timeZone));
  const isNotFutureDate = Schema.is(
    Schema.String.check(createNotFutureDateFilter({ today })),
  );

  if (!isNotFutureDate(date)) {
    return new AbsenceDateInFutureError();
  }

  return { _tag: "AbsenceRecordAllowed" as const };
}
