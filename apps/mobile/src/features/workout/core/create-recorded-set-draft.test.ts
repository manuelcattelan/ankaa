import { createRecordedSetDraft } from "#/features/workout/core/create-recorded-set-draft.ts";

describe("createRecordedSetDraft", () => {
  it("creates the Draft of a recorded Set from its Segments", () => {
    expect(
      createRecordedSetDraft({
        id: "01900000-0000-7000-8000-000000000301",
        segments: [
          { amount: 8, weight: 62.5 },
          { amount: 6, weight: null },
        ],
      }),
    ).toStrictEqual({
      id: "01900000-0000-7000-8000-000000000301",
      segments: [
        { amount: "8", weight: "62.5" },
        { amount: "6", weight: "" },
      ],
    });
  });

  it("creates the Draft of a new Set with one empty Segment and no id yet", () => {
    expect(createRecordedSetDraft(null)).toStrictEqual({
      id: "",
      segments: [{ amount: "", weight: "" }],
    });
  });
});
