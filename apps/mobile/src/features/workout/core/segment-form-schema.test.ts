import { segmentFormSchema } from "#/features/workout/core/segment-form-schema.ts";
import { decodeForm } from "#/shared/core/decode-form.ts";

const SEGMENT_DRAFT = { amount: "8", weight: "62.5" };

describe("segmentFormSchema", () => {
  it("decodes a Segment Draft into its Amount and weight", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: segmentFormSchema,
        values: SEGMENT_DRAFT,
      }).value,
    ).toStrictEqual({ amount: 8, weight: 62.5 });
  });

  it("decodes an empty weight into no weight", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: segmentFormSchema,
        values: { ...SEGMENT_DRAFT, weight: " " },
      }).value,
    ).toStrictEqual({ amount: 8, weight: null });
  });

  it("rejects an empty Amount with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: segmentFormSchema,
        values: { ...SEGMENT_DRAFT, amount: "" },
      }).errorMessages,
    ).toStrictEqual({
      amount: "This number isn't valid: enter a whole number of at least 1.",
      weight: null,
    });
  });

  it("rejects an Amount of 0 with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: segmentFormSchema,
        values: { ...SEGMENT_DRAFT, amount: "0" },
      }).errorMessages,
    ).toStrictEqual({
      amount: "This number isn't valid: enter a whole number of at least 1.",
      weight: null,
    });
  });

  it("rejects a weight above the largest one with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: segmentFormSchema,
        values: { ...SEGMENT_DRAFT, weight: "10000" },
      }).errorMessages,
    ).toStrictEqual({
      amount: null,
      weight:
        "This weight isn't valid: enter a number from 0.01 to 9999.99, with at most two decimal places.",
    });
  });

  it("rejects a weight with three decimal places with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: segmentFormSchema,
        values: { ...SEGMENT_DRAFT, weight: "62.555" },
      }).errorMessages,
    ).toStrictEqual({
      amount: null,
      weight:
        "This weight isn't valid: enter a number from 0.01 to 9999.99, with at most two decimal places.",
    });
  });

  it("rejects a weight that isn't a number with its message", () => {
    expect(
      decodeForm({
        hasSubmitted: true,
        schema: segmentFormSchema,
        values: { ...SEGMENT_DRAFT, weight: "heavy" },
      }).errorMessages,
    ).toStrictEqual({
      amount: null,
      weight:
        "This weight isn't valid: enter a number from 0.01 to 9999.99, with at most two decimal places.",
    });
  });
});
