import * as DateTime from "effect/DateTime";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

/**
 * Checks that a text is a calendar date written as `YYYY-MM-DD`, with no time
 * and no time zone. It reads the text as midnight in UTC and writes it back,
 * because parsing alone moves a day that its month doesn't have, such as 29
 * February 2026, to the next month.
 */
export const calendarDateFilter = Schema.makeFilter(
  (date: string) =>
    Option.exists(
      DateTime.make(date),
      (dateTime) => DateTime.formatIsoDateUtc(dateTime) === date,
    ),
  { expected: "a calendar date written as YYYY-MM-DD" },
);
