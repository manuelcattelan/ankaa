import { getSegmentTimerCount } from "#/features/workout/core/get-segment-timer-count.ts";

/**
 * Gives the planned seconds of a Segment timer, which fill in its Segment,
 * when it reaches zero between `previousTickTime` and `tickTime`, or `null`
 * when it doesn't reach zero in between, or counts up because its Set has no
 * planned Amount.
 */
export function getSegmentTimerZeroSeconds({
  previousTickTime,
  segmentTimer,
  tickTime,
}: {
  previousTickTime: number;
  segmentTimer: {
    leadInSeconds: number;
    seconds: null | number;
    startTime: number;
  };
  tickTime: number;
}) {
  if (segmentTimer.seconds === null) {
    return null;
  }

  const previousCountedSeconds = getSegmentTimerCount({
    currentTime: previousTickTime,
    segmentTimer,
  }).countedSeconds;
  const countedSeconds = getSegmentTimerCount({
    currentTime: tickTime,
    segmentTimer,
  }).countedSeconds;

  return previousCountedSeconds < segmentTimer.seconds &&
    countedSeconds >= segmentTimer.seconds
    ? segmentTimer.seconds
    : null;
}
