import { createAbsenceFormSchema } from "#/features/absence/core/create-absence-form-schema.ts";
import { decodeForm } from "#/shared/core/decode-form.ts";

const ABSENCE_FORM_VALUES = {
  date: "2026-11-02",
  note: "Sore shoulder",
  reason: "pain" as const,
};

describe("createAbsenceFormSchema", () => {
  it("decodes today's date, the reason and an empty note into no note", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: createAbsenceFormSchema({ today: "2026-11-02" }),
        values: { ...ABSENCE_FORM_VALUES, note: " " },
      }).value,
    ).toStrictEqual({ date: "2026-11-02", note: null, reason: "pain" });
  });

  it("rejects a date after today with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: createAbsenceFormSchema({ today: "2026-11-02" }),
        values: { ...ABSENCE_FORM_VALUES, date: "2026-11-03" },
      }).errorMessages.date,
    ).toBe("This day hasn't come yet: pick today or a day before it.");
  });

  it("rejects an Absence with no reason with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: createAbsenceFormSchema({ today: "2026-11-02" }),
        values: { ...ABSENCE_FORM_VALUES, reason: null },
      }).errorMessages.reason,
    ).toBe("Pick why you couldn't train.");
  });
});
