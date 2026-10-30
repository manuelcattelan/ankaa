import { useEffect, useState } from "react";

import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";
import { formatElapsedTime } from "#/features/workout/core/format-elapsed-time.ts";
import { getElapsedSeconds } from "#/features/workout/core/get-elapsed-seconds.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Text } from "#/shared/components/text.tsx";

/**
 * Shows the time elapsed since the Workout started at `startedAt`, read from
 * the clock every second.
 */
export function WorkoutElapsedTime({ startedAt }: { startedAt: string }) {
  const [currentTime, setCurrentTime] = useState(Date.now);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, MILLISECONDS_PER_SECOND);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Text>
      {WORKOUT_MESSAGES.elapsedTimeStatus(
        formatElapsedTime(getElapsedSeconds({ currentTime, startedAt })),
      )}
    </Text>
  );
}
