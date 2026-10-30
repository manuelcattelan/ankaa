import { isRecordedSetDraftSaved } from "#/features/workout/core/is-recorded-set-draft-saved.ts";

const RECORDED_SET = {
  id: "01900000-0000-7000-8000-000000000301",
  segments: [{ amount: 8, weight: 62.5 }],
};

describe("isRecordedSetDraftSaved", () => {
  it("tells that a Draft with the Segments of its recorded Set is Saved", () => {
    expect(
      isRecordedSetDraftSaved({
        draft: {
          id: "01900000-0000-7000-8000-000000000301",
          segments: [{ amount: "8", weight: "62.5" }],
        },
        recordedSet: RECORDED_SET,
      }),
    ).toBe(true);
  });

  it("tells that a Draft with another weight than its recorded Set isn't Saved", () => {
    expect(
      isRecordedSetDraftSaved({
        draft: {
          id: "01900000-0000-7000-8000-000000000301",
          segments: [{ amount: "8", weight: "65" }],
        },
        recordedSet: RECORDED_SET,
      }),
    ).toBe(false);
  });

  it("tells that a Draft with one more Segment than its recorded Set isn't Saved", () => {
    expect(
      isRecordedSetDraftSaved({
        draft: {
          id: "01900000-0000-7000-8000-000000000301",
          segments: [
            { amount: "8", weight: "62.5" },
            { amount: "", weight: "" },
          ],
        },
        recordedSet: RECORDED_SET,
      }),
    ).toBe(false);
  });

  it("tells that the empty Draft of a new Set has nothing to Save", () => {
    expect(
      isRecordedSetDraftSaved({
        draft: { id: "", segments: [{ amount: "", weight: "" }] },
        recordedSet: null,
      }),
    ).toBe(true);
  });

  it("tells that the Draft of a new Set with an Amount isn't Saved", () => {
    expect(
      isRecordedSetDraftSaved({
        draft: { id: "", segments: [{ amount: "8", weight: "" }] },
        recordedSet: null,
      }),
    ).toBe(false);
  });
});
