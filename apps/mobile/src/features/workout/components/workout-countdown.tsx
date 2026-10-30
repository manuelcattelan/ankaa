import { useEffect, useState } from "react";

import type { Countdown } from "#/features/workout/core/get-countdown-remaining-seconds.ts";

import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";
import { getCountdownRemainingSeconds } from "#/features/workout/core/get-countdown-remaining-seconds.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Text } from "#/shared/components/text.tsx";

/**
 * Shows the seconds left in `countdown`, read from the clock every second so
 * the count stays right after the app comes back from the background, and
 * calls `onEnd` once it reaches 0.
 */
export function WorkoutCountdown({
  countdown,
  onEnd,
}: {
  countdown: Countdown;
  onEnd: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(countdown.startTime);

  const remainingSeconds = getCountdownRemainingSeconds({
    countdown,
    currentTime,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const tickTime = Date.now();

      setCurrentTime(tickTime);

      if (
        getCountdownRemainingSeconds({ countdown, currentTime: tickTime }) === 0
      ) {
        onEnd();
      }
    }, MILLISECONDS_PER_SECOND);

    return () => {
      clearInterval(interval);
    };
  }, [countdown, onEnd]);

  return (
    <Text>
      {WORKOUT_MESSAGES.countdownStatusLabels[countdown.kind](remainingSeconds)}
    </Text>
  );
}
