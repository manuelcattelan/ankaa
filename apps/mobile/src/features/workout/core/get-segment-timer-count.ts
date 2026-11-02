import type { Countdown } from "#/features/workout/core/countdown.ts";

import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";

/**
 * Gives the whole seconds left in the lead-in of a Segment timer at
 * `currentTime`, counting a second as left until it has fully passed, and the
 * whole seconds the Segment timer has counted since its lead-in ended, past
 * its planned seconds included.
 */
export function getSegmentTimerCount({
  countdown,
  currentTime,
}: {
  countdown: Countdown;
  currentTime: number;
}) {
  const passedSeconds = Math.floor(
    (currentTime - countdown.startTime) / MILLISECONDS_PER_SECOND,
  );

  return {
    countedSeconds: Math.max(passedSeconds - countdown.leadInSeconds, 0),
    leadInRemainingSeconds: Math.max(
      countdown.leadInSeconds - passedSeconds,
      0,
    ),
  };
}
