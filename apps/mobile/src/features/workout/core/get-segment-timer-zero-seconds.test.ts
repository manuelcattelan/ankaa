import { getSegmentTimerZeroSeconds } from "#/features/workout/core/get-segment-timer-zero-seconds.ts";

const SEGMENT_TIMER = { leadInSeconds: 5, seconds: 60, startTime: 1_000_000 };

describe("getSegmentTimerZeroSeconds", () => {
  it("gives the planned seconds when the Segment timer reaches zero between the two ticks", () => {
    expect(
      getSegmentTimerZeroSeconds({
        previousTickTime: 1_064_000,
        segmentTimer: SEGMENT_TIMER,
        tickTime: 1_065_000,
      }),
    ).toBe(60);
  });

  it("gives null before the Segment timer reaches zero", () => {
    expect(
      getSegmentTimerZeroSeconds({
        previousTickTime: 1_063_000,
        segmentTimer: SEGMENT_TIMER,
        tickTime: 1_064_000,
      }),
    ).toBeNull();
  });

  it("gives null after the Segment timer has reached zero", () => {
    expect(
      getSegmentTimerZeroSeconds({
        previousTickTime: 1_065_000,
        segmentTimer: SEGMENT_TIMER,
        tickTime: 1_066_000,
      }),
    ).toBeNull();
  });

  it("gives null for a Segment timer that counts up", () => {
    expect(
      getSegmentTimerZeroSeconds({
        previousTickTime: 1_064_000,
        segmentTimer: { ...SEGMENT_TIMER, seconds: null },
        tickTime: 1_065_000,
      }),
    ).toBeNull();
  });
});
