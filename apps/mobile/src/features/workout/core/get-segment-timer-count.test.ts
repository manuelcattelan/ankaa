import { getSegmentTimerCount } from "#/features/workout/core/get-segment-timer-count.ts";

const SEGMENT_TIMER = { leadInSeconds: 5, startTime: 1_000_000 };

describe("getSegmentTimerCount", () => {
  it("gives every second of the lead-in and nothing counted when the Segment timer has just started", () => {
    expect(
      getSegmentTimerCount({
        currentTime: 1_000_000,
        segmentTimer: SEGMENT_TIMER,
      }),
    ).toStrictEqual({ countedSeconds: 0, leadInRemainingSeconds: 5 });
  });

  it("counts a second of the lead-in as left until it has fully passed", () => {
    expect(
      getSegmentTimerCount({
        currentTime: 1_004_999,
        segmentTimer: SEGMENT_TIMER,
      }),
    ).toStrictEqual({ countedSeconds: 0, leadInRemainingSeconds: 1 });
  });

  it("counts each whole second that has passed since the lead-in ended", () => {
    expect(
      getSegmentTimerCount({
        currentTime: 1_065_500,
        segmentTimer: SEGMENT_TIMER,
      }),
    ).toStrictEqual({ countedSeconds: 60, leadInRemainingSeconds: 0 });
  });
});
