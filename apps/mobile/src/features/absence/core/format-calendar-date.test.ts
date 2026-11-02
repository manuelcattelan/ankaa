import * as DateTime from "effect/DateTime";

import { formatCalendarDate } from "#/features/absence/core/format-calendar-date.ts";

describe("formatCalendarDate", () => {
  it("formats the calendar date of a time in the time zone of the device, which may be a day after UTC's", () => {
    expect(
      formatCalendarDate({
        date: new Date("2026-11-01T20:00:00.000Z"),
        timeZone: DateTime.zoneMakeNamedUnsafe("Australia/Sydney"),
      }),
    ).toBe("2026-11-02");
  });
});
