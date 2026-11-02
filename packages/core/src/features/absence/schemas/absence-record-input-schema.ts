import * as Schema from "effect/Schema";

import { calendarDateFilter } from "#/features/absence/filters/calendar-date-filter.ts";
import { SKIP_REASONS } from "#/shared/constants/skip-reasons.ts";
import { idSchema } from "#/shared/schemas/id-schema.ts";

export type AbsenceRecordInput = typeof absenceRecordInputSchema.Type;

/**
 * The input as the device sends it, with the time zone as its IANA name.
 */
export type AbsenceRecordInputEncoded = typeof absenceRecordInputSchema.Encoded;

/**
 * The Absence that `absence.record` records for a Routine of the User: a
 * date, a reason that an Absence always has, so its note never lacks one, an
 * optional note, and the IANA time zone of the device, in which the date
 * mustn't be in the future.
 */
export const absenceRecordInputSchema = Schema.Struct({
  date: Schema.String.check(calendarDateFilter),
  note: Schema.NullOr(Schema.String),
  reason: Schema.Literals(SKIP_REASONS),
  routineId: idSchema,
  timeZone: Schema.TimeZoneNamedFromString,
});
