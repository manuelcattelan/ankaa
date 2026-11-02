import type { Countdown } from "#/features/workout/core/countdown.ts";
import type { PlannedSet } from "#/shared/workout.ts";

import { WorkoutCountdown } from "#/features/workout/components/workout-countdown.tsx";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { Button } from "#/shared/components/button.tsx";

/**
 * Lets the User start the countdown of a Set's planned Rest, whether or not
 * it's Saved yet, and of a Pause when it's a Rest-pause set, and shows the
 * countdown started under the Set.
 */
export function WorkoutSetCountdown({
  canStartRest,
  plannedSet,
  position,
  workoutExerciseId,
}: {
  canStartRest: boolean;
  plannedSet: Omit<PlannedSet, "id">;
  position: number;
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
    seconds,
  }: {
    kind: Countdown["kind"];
    seconds: number;
  }) {
    workoutContext.onStartCountdown({
      kind,
      position,
      seconds,
      workoutExerciseId,
    });
  }

  return (
    <>
      {pauseSeconds === null ? null : (
        <Button
          onPress={() => {
            handleStartCountdown({ kind: "pause", seconds: pauseSeconds });
          }}
          title={WORKOUT_MESSAGES.startPauseButton}
        />
      )}
      {restSeconds === null ? null : (
        <Button
          onPress={() => {
            handleStartCountdown({
              kind: "rest",
              seconds: restSeconds,
            });
          }}
          title={WORKOUT_MESSAGES.startRestButton}
        />
      )}
      {shownCountdown === null ? null : (
        <>
          <WorkoutCountdown
            countdown={shownCountdown}
            key={shownCountdown.startTime}
            onEnd={workoutContext.onEndCountdown}
          />
          {shownCountdown.kind === "rest" ? (
            <Button
              onPress={workoutContext.onCancelCountdown}
              title={WORKOUT_MESSAGES.cancelRestButton}
            />
          ) : null}
        </>
      )}
    </>
  );
}
