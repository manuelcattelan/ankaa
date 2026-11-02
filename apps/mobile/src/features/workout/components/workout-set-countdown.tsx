import type { Countdown } from "#/features/workout/core/countdown.ts";
import type { FilledSegment } from "#/features/workout/core/filled-segment.ts";
import type { PlannedSet } from "#/shared/workout.ts";

import { WorkoutCountdown } from "#/features/workout/components/workout-countdown.tsx";
import { WorkoutSegmentTimer } from "#/features/workout/components/workout-segment-timer.tsx";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Button } from "#/shared/components/button.tsx";

/**
 * The seconds a Segment timer gives the User to get into position before it
 * counts, so the Segment it times doesn't end short by the time it takes to
 * put the phone down.
 */
const SEGMENT_TIMER_LEAD_IN_SECONDS = 5;

/**
 * Lets the User start the countdown of a Set's planned Rest, whether or not
 * it's Saved yet, of a Pause when it's a Rest-pause set, and a Segment timer
 * of its planned Amount, or counting up when it has none, that fills in the
 * Segment at `segmentTimerSegmentPosition` when it has one, and shows the
 * countdown started under the Set. Calls `onFillSegment` with the seconds a
 * Segment timer fills in.
 */
export function WorkoutSetCountdown({
  canStartRest,
  onFillSegment,
  plannedSet,
  position,
  segmentTimerSegmentPosition,
  workoutExerciseId,
}: {
  canStartRest: boolean;
  onFillSegment: (filledSegment: FilledSegment) => void;
  plannedSet: Omit<PlannedSet, "id">;
  position: number;
  segmentTimerSegmentPosition: null | number;
  workoutExerciseId: string;
}) {
  const workoutContext = useWorkoutContext();

  const restSeconds = canStartRest ? plannedSet.restSeconds : null;
  const pauseSeconds =
    plannedSet.intensityTechnique?._tag === "RestPauseSet"
      ? plannedSet.intensityTechnique.pauseSeconds
      : null;
  const shownCountdown =
    workoutContext.countdown?.workoutExerciseId === workoutExerciseId &&
    workoutContext.countdown.position === position
      ? workoutContext.countdown
      : null;

  function renderShownCountdown(countdown: Countdown) {
    switch (countdown.kind) {
      case "pause":
      case "rest": {
        return (
          <WorkoutCountdown
            countdown={countdown}
            key={countdown.startTime}
            onEnd={workoutContext.onEndCountdown}
          />
        );
      }
      case "segmentTimer": {
        return (
          <WorkoutSegmentTimer
            key={countdown.startTime}
            onFillSegment={onFillSegment}
            onStop={workoutContext.onStopCountdown}
            segmentTimer={countdown}
          />
        );
      }
    }
  }

  return (
    <>
      {segmentTimerSegmentPosition === null ? null : (
        <Button
          onPress={() => {
            workoutContext.onStartCountdown({
              kind: "segmentTimer",
              leadInSeconds: SEGMENT_TIMER_LEAD_IN_SECONDS,
              position,
              seconds: plannedSet.amount,
              segmentPosition: segmentTimerSegmentPosition,
              startTime: Date.now(),
              workoutExerciseId,
            });
          }}
          title={WORKOUT_MESSAGES.startSegmentTimerButton}
        />
      )}
      {pauseSeconds === null ? null : (
        <Button
          onPress={() => {
            workoutContext.onStartCountdown({
              kind: "pause",
              position,
              seconds: pauseSeconds,
              startTime: Date.now(),
              workoutExerciseId,
            });
          }}
          title={WORKOUT_MESSAGES.startPauseButton}
        />
      )}
      {restSeconds === null ? null : (
        <Button
          onPress={() => {
            workoutContext.onStartCountdown({
              kind: "rest",
              position,
              seconds: restSeconds,
              startTime: Date.now(),
              workoutExerciseId,
            });
          }}
          title={WORKOUT_MESSAGES.startRestButton}
        />
      )}
      {shownCountdown === null ? null : renderShownCountdown(shownCountdown)}
    </>
  );
}
