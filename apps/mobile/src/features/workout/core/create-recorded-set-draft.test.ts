import { createRecordedSetDraft } from "#/features/workout/core/create-recorded-set-draft.ts";

describe("createRecordedSetDraft", () => {
  it("creates the Draft of a recorded Set from its Segments", () => {
    expect(
      createRecordedSetDraft({
        id: "set-1",
        segments: [
          { amount: 8, weight: 62.5 },
          { amount: 6, weight: null },
        ],
      }),
    ).toStrictEqual({
      id: "set-1",
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
