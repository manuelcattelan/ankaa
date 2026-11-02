import { getSegmentTimerSegmentPosition } from "#/features/workout/core/get-segment-timer-segment-position.ts";

describe("getSegmentTimerSegmentPosition", () => {
  it("gives the position of the first Segment with no Amount", () => {
    expect(
      getSegmentTimerSegmentPosition({
        maximumSegmentCount: 3,
        segments: [
          { amount: "30", weight: "" },
          { amount: "", weight: "" },
          { amount: "", weight: "" },
        ],
      }),
    ).toBe(1);
  });

  it("gives the position of a new Segment when every Segment has an Amount and the Set allows another", () => {
    expect(
      getSegmentTimerSegmentPosition({
        maximumSegmentCount: 3,
        segments: [{ amount: "30", weight: "" }],
      }),
    ).toBe(1);
  });

  it("gives null when every Segment has an Amount and the Set allows no other", () => {
    expect(
      getSegmentTimerSegmentPosition({
        maximumSegmentCount: 1,
        segments: [{ amount: "30", weight: "" }],
      }),
    ).toBeNull();
  });
});
