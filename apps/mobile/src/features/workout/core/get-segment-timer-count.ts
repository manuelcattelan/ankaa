import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";

/**
 * Gives the whole seconds left in the lead-in of a Segment timer at
 * `currentTime`, counting a second as left until it has fully passed, and the
 * whole seconds the Segment timer has counted since its lead-in ended, past
 * its planned seconds included.
 */
export function getSegmentTimerCount({
  currentTime,
  segmentTimer,
}: {
  currentTime: number;
  segmentTimer: { leadInSeconds: number; startTime: number };
}) {
  const passedSeconds = Math.floor(
    (currentTime - segmentTimer.startTime) / MILLISECONDS_PER_SECOND,
  );

  return {
    countedSeconds: Math.max(passedSeconds - segmentTimer.leadInSeconds, 0),
    leadInRemainingSeconds: Math.max(
      segmentTimer.leadInSeconds - passedSeconds,
      0,
    ),
  };
}
