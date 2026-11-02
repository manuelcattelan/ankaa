import type * as DateTime from "effect/DateTime";

import { AbsenceNotFoundError } from "@ankaa/core/features/absence/errors/absence-not-found-error";

import { decideAbsenceRecord } from "#/features/absence/core/decide-absence-record.ts";

/**
 * Decides whether an Absence may be edited, given the Absence with the edited
 * id, or `null` when none has it, and the Routine that the edit names, or
 * `null` when none has its id. The edited Absence must be one of the User's,
 * and its new fields go through the same checks as recording an Absence.
 */
export function decideAbsenceEdit({
  absence,
  date,
  now,
  routine,
  timeZone,
  userId,
}: {
  absence: null | { userId: string };
  date: string;
  now: DateTime.Utc;
  routine: null | { deletedAt: Date | null; userId: string };
  timeZone: DateTime.TimeZone;
  userId: string;
}) {
  if (absence?.userId !== userId) {
    return new AbsenceNotFoundError();
  }

  const absenceRecordOutcome = decideAbsenceRecord({
    date,
    now,
    routine,
    timeZone,
    userId,
  });

  if (absenceRecordOutcome._tag !== "AbsenceRecordAllowed") {
    return absenceRecordOutcome;
  }

  return { _tag: "AbsenceEditAllowed" as const };
}
