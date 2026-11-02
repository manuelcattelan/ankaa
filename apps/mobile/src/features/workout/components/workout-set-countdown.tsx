import type { Countdown } from "#/features/workout/core/countdown.ts";
import type { PlannedSet } from "#/shared/workout.ts";

import { WorkoutCountdown } from "#/features/workout/components/workout-countdown.tsx";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Button } from "#/shared/components/button.tsx";

/**
 * The seconds a Segment timer gives the User to get into position before it
 * counts, so a timed Set doesn't end short by the time it takes to put the
 * phone down.
 */
const SEGMENT_TIMER_LEAD_IN_SECONDS = 5;

/**
 * Lets the User start the countdown of a Set's planned Rest, whether or not
 * it's Saved yet, of a Pause when it's a Rest-pause set, and of a Segment
 * timer of `segmentTimerSeconds` when it has one, and shows the countdown
 * started under the Set. Calls `onEndSegmentTimer` with the seconds counted
 * when a Segment timer reaches zero.
 */
export function WorkoutSetCountdown({
  canStartRest,
  onEndSegmentTimer,
  plannedSet,
  position,
  segmentTimerSeconds,
  workoutExerciseId,
}: {
  canStartRest: boolean;
  onEndSegmentTimer: (seconds: number) => void;
  plannedSet: Omit<PlannedSet, "id">;
  position: number;
  segmentTimerSeconds: null | number;
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

  function handleStartCountdown({
    kind,
    leadInSeconds,
    seconds,
  }: {
    kind: Countdown["kind"];
    leadInSeconds: number;
    seconds: number;
  }) {
    workoutContext.onStartCountdown({
      kind,
      leadInSeconds,
      position,
      seconds,
      workoutExerciseId,
    });
  }

  return (
    <>
      {segmentTimerSeconds === null ? null : (
        <Button
          onPress={() => {
            handleStartCountdown({
              kind: "segmentTimer",
              leadInSeconds: SEGMENT_TIMER_LEAD_IN_SECONDS,
              seconds: segmentTimerSeconds,
            });
          }}
          title={WORKOUT_MESSAGES.startSegmentTimerButton}
        />
      )}
      {pauseSeconds === null ? null : (
        <Button
          onPress={() => {
            handleStartCountdown({
              kind: "pause",
              leadInSeconds: 0,
              seconds: pauseSeconds,
            });
          }}
          title={WORKOUT_MESSAGES.startPauseButton}
        />
      )}
      {restSeconds === null ? null : (
        <Button
          onPress={() => {
            handleStartCountdown({
              kind: "rest",
              leadInSeconds: 0,
              seconds: restSeconds,
            });
          }}
          title={WORKOUT_MESSAGES.startRestButton}
        />
      )}
      {shownCountdown === null ? null : (
        <WorkoutCountdown
          countdown={shownCountdown}
          key={shownCountdown.startTime}
          onEnd={() => {
            if (shownCountdown.kind === "segmentTimer") {
              onEndSegmentTimer(shownCountdown.seconds);
            }

            workoutContext.onEndCountdown();
          }}
        />
      )}
    </>
  );
}
