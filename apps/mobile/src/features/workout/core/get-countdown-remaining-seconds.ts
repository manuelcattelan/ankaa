import type { Countdown } from "#/features/workout/core/countdown.ts";

import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";

/**
 * Gives the whole seconds left in `countdown` at `currentTime`, its lead-in
 * included, counting a second as left until it has fully passed, and 0 once
 * the countdown has ended.
 */
export function getCountdownRemainingSeconds({
  countdown,
  currentTime,
}: {
  countdown: Countdown;
  currentTime: number;
}) {
  const passedSeconds = Math.floor(
    (currentTime - countdown.startTime) / MILLISECONDS_PER_SECOND,
  );

  return Math.max(
    countdown.leadInSeconds + countdown.seconds - passedSeconds,
    0,
  );
}
