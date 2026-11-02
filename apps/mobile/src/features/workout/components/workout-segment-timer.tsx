import { useEffect, useState } from "react";

import type { Countdown } from "#/features/workout/core/countdown.ts";
import type { FilledSegment } from "#/features/workout/core/filled-segment.ts";

import { MILLISECONDS_PER_SECOND } from "#/features/workout/constants/milliseconds-per-second.ts";
import { getSegmentTimerCount } from "#/features/workout/core/get-segment-timer-count.ts";
import { getSegmentTimerZeroSeconds } from "#/features/workout/core/get-segment-timer-zero-seconds.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { Text } from "#/shared/components/text.tsx";

/**
 * Shows the seconds left in the lead-in of `segmentTimer` while it lasts,
 * then the seconds left in its planned seconds, then the seconds past them,
 * or, when it counts up, the seconds it has counted,
 * read from the clock every second so the count stays right after the app
 * comes back from the background. Calls `onFillSegment` to fill in its
 * Segment with the planned seconds once it reaches zero, and with the
 * seconds counted when the User stops it, before `onStop`.
 */
export function WorkoutSegmentTimer({
  onFillSegment,
  onStop,
  segmentTimer,
}: {
  onFillSegment: (filledSegment: FilledSegment) => void;
  onStop: () => void;
  segmentTimer: Extract<Countdown, { kind: "segmentTimer" }>;
}) {
  const [currentTime, setCurrentTime] = useState(segmentTimer.startTime);

  const segmentTimerCount = getSegmentTimerCount({
    currentTime,
    segmentTimer,
  });

  useEffect(() => {
    let previousTickTime = Date.now();

    const interval = setInterval(() => {
      const tickTime = Date.now();
      const zeroSeconds = getSegmentTimerZeroSeconds({
        previousTickTime,
        segmentTimer,
        tickTime,
      });

      previousTickTime = tickTime;
      setCurrentTime(tickTime);

      if (zeroSeconds !== null) {
        onFillSegment({
          position: segmentTimer.segmentPosition,
          seconds: zeroSeconds,
        });
      }
    }, MILLISECONDS_PER_SECOND);

    return () => {
      clearInterval(interval);
    };
  }, [onFillSegment, segmentTimer]);

  function getStatusLabel() {
    if (segmentTimerCount.leadInRemainingSeconds > 0) {
      return WORKOUT_MESSAGES.countdownLeadInStatusLabel(
        segmentTimerCount.leadInRemainingSeconds,
      );
    }

    if (segmentTimer.seconds === null) {
      return WORKOUT_MESSAGES.segmentTimerCountedSecondsStatusLabel(
        segmentTimerCount.countedSeconds,
      );
    }

    return segmentTimerCount.countedSeconds > segmentTimer.seconds
      ? WORKOUT_MESSAGES.segmentTimerExtraSecondsStatusLabel(
          segmentTimerCount.countedSeconds - segmentTimer.seconds,
        )
      : WORKOUT_MESSAGES.countdownStatusLabels.segmentTimer(
          segmentTimer.seconds - segmentTimerCount.countedSeconds,
        );
  }

  return (
    <>
      <Text>{getStatusLabel()}</Text>
      <Button
        onPress={() => {
          onFillSegment({
            position: segmentTimer.segmentPosition,
            seconds: getSegmentTimerCount({
              currentTime: Date.now(),
              segmentTimer,
            }).countedSeconds,
          });
          onStop();
        }}
        title={WORKOUT_MESSAGES.stopSegmentTimerButton}
      />
    </>
  );
}
