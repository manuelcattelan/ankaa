import { skipFormSchema } from "#/features/workout/core/skip-form-schema.ts";
import { decodeForm } from "#/shared/core/decode-form.ts";

const SKIP_DRAFT = { note: "Sore shoulder", reason: "pain" as const };

describe("skipFormSchema", () => {
  it("decodes a skip Draft into its reason and note", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: skipFormSchema,
        values: SKIP_DRAFT,
      }).value,
    ).toStrictEqual({ note: "Sore shoulder", reason: "pain" });
  });

  it("decodes an empty note into no note", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: skipFormSchema,
        values: { ...SKIP_DRAFT, note: " " },
      }).value,
    ).toStrictEqual({ note: null, reason: "pain" });
  });

  it("rejects a note with no reason with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: skipFormSchema,
        values: { ...SKIP_DRAFT, reason: null },
      }).errorMessage,
    ).toBe(
      "This note needs a reason: pick why you skipped the exercise, or clear the note.",
    );
  });
});
