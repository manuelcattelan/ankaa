import { useEffect, useState } from "react";

import type { Countdown } from "#/features/workout/core/countdown.ts";

import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";
import { getSegmentTimerCount } from "#/features/workout/core/get-segment-timer-count.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { Text } from "#/shared/components/text.tsx";

/**
 * Shows the seconds left in the lead-in of a Segment timer while it lasts,
 * then the seconds left in its planned seconds, then the seconds past them,
 * or, when it counts up, the seconds it has counted,
 * read from the clock every second so the count stays right after the app
 * comes back from the background. Calls `onFillSegment` to fill in the
 * Segment at `segmentPosition` with the planned seconds once it reaches zero,
 * and with the seconds counted when the User stops it, before `onStop`.
 */
export function WorkoutSegmentTimer({
  countdown,
  onFillSegment,
  onStop,
  segmentPosition,
}: {
  countdown: Countdown;
  onFillSegment: (filledSegment: { position: number; seconds: number }) => void;
  onStop: () => void;
  segmentPosition: number;
}) {
  const [currentTime, setCurrentTime] = useState(countdown.startTime);

  const segmentTimerCount = getSegmentTimerCount({ countdown, currentTime });

  useEffect(() => {
    const plannedSeconds = countdown.seconds;
    let previousTickTime = Date.now();

    const interval = setInterval(() => {
      const tickTime = Date.now();
      const hasReachedZero =
        plannedSeconds !== null &&
        getSegmentTimerCount({ countdown, currentTime: previousTickTime })
          .countedSeconds < plannedSeconds &&
        getSegmentTimerCount({ countdown, currentTime: tickTime })
          .countedSeconds >= plannedSeconds;

      previousTickTime = tickTime;
      setCurrentTime(tickTime);

      if (hasReachedZero) {
        onFillSegment({ position: segmentPosition, seconds: plannedSeconds });
      }
    }, MILLISECONDS_PER_SECOND);

    return () => {
      clearInterval(interval);
    };
  }, [countdown, onFillSegment, segmentPosition]);

  function getStatusLabel() {
    if (segmentTimerCount.leadInRemainingSeconds > 0) {
      return WORKOUT_MESSAGES.countdownLeadInStatusLabel(
        segmentTimerCount.leadInRemainingSeconds,
      );
    }

    if (countdown.seconds === null) {
      return WORKOUT_MESSAGES.segmentTimerCountedSecondsStatusLabel(
        segmentTimerCount.countedSeconds,
      );
    }

    return segmentTimerCount.countedSeconds > countdown.seconds
      ? WORKOUT_MESSAGES.segmentTimerExtraSecondsStatusLabel(
          segmentTimerCount.countedSeconds - countdown.seconds,
        )
      : WORKOUT_MESSAGES.countdownStatusLabels.segmentTimer(
          countdown.seconds - segmentTimerCount.countedSeconds,
        );
  }

  return (
    <>
      <Text>{getStatusLabel()}</Text>
      <Button
        onPress={() => {
          onFillSegment({
            position: segmentPosition,
            seconds: getSegmentTimerCount({
              countdown,
              currentTime: Date.now(),
            }).countedSeconds,
          });
          onStop();
        }}
        title={WORKOUT_MESSAGES.stopSegmentTimerButton}
      />
    </>
  );
}
