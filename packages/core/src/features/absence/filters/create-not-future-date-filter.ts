import * as Schema from "effect/Schema";

/**
 * Builds the Filter that checks that a calendar date, written as
 * `YYYY-MM-DD`, isn't after `today`, the calendar date where the User is.
 */
export function createNotFutureDateFilter({ today }: { today: string }) {
  return Schema.makeFilter(
    // Calendar dates in ISO 8601's `YYYY-MM-DD` order as strings do:
    // https://en.wikipedia.org/wiki/ISO_8601#General_principles
    (date: string) => date <= today,
    { expected: "a date that isn't after today" },
  );
}
