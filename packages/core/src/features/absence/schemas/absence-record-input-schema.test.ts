import * as DateTime from "effect/DateTime";
import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { absenceRecordInputSchema } from "#/features/absence/schemas/absence-record-input-schema.ts";

const ABSENCE_RECORD_INPUT = {
  date: "2026-11-02",
  note: "Sore shoulder",
  reason: "pain",
  routineId: "019a0000-0000-7000-8000-000000000001",
  timeZone: "Australia/Sydney",
};

const decodeAbsenceRecordInput = Schema.decodeUnknownSync(
  absenceRecordInputSchema,
);

describe("absenceRecordInputSchema", () => {
  it("decodes the time zone name into its IANA time zone", () => {
    expect(decodeAbsenceRecordInput(ABSENCE_RECORD_INPUT)).toStrictEqual({
      ...ABSENCE_RECORD_INPUT,
      timeZone: DateTime.zoneMakeNamedUnsafe("Australia/Sydney"),
    });
  });

  it("rejects a time zone name that isn't an IANA time zone", () => {
    expect(() =>
      decodeAbsenceRecordInput({
        ...ABSENCE_RECORD_INPUT,
        timeZone: "Not/AZone",
      }),
    ).toThrow("Expected a valid IANA time zone");
  });

  it("rejects a note without a reason", () => {
    expect(() =>
      decodeAbsenceRecordInput({ ...ABSENCE_RECORD_INPUT, reason: null }),
    ).toThrow('Expected "low_on_time" | "low_energy" | "pain" | "other"');
  });

  it("rejects a date that isn't a calendar date", () => {
    expect(() =>
      decodeAbsenceRecordInput({ ...ABSENCE_RECORD_INPUT, date: "2026-02-29" }),
    ).toThrow("Expected a calendar date written as YYYY-MM-DD");
  });
});
