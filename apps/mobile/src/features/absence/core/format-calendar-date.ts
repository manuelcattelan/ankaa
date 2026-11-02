import * as DateTime from "effect/DateTime";

/**
 * Formats the calendar date, as `YYYY-MM-DD`, on which `date` falls in
 * `timeZone`, so a date picked on the device names the day the User saw.
 */
export function formatCalendarDate({
  date,
  timeZone,
}: {
  date: Date;
  timeZone: DateTime.TimeZone;
}) {
  return DateTime.formatIsoDate(
    DateTime.setZone(DateTime.fromDateUnsafe(date), timeZone),
  );
}
