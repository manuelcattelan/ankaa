import { Fragment } from "react";

import type { Countdown } from "#/features/workout/core/get-countdown-remaining-seconds.ts";
import type {
  RecordedSetDraftEntry,
  RecordedSetDraftsAction,
} from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import type {
  WorkoutExerciseDrafts,
  WorkoutExerciseDraftsAction,
} from "#/features/workout/core/workout-exercise-drafts-reducer.ts";
import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutExercise } from "#/features/workout/components/workout-exercise.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const MINIMUM_SUPERSET_EXERCISE_COUNT = 2;

/**
 * Shows the exercises of an Exercise group, each after its Warm-up exercises.
 * A Superset rests only after one Set of each exercise, so only its last
 * exercise offers to start Rest.
 */
export function WorkoutExerciseGroup({
  countdown,
  dispatch,
  dispatchWorkoutExerciseDrafts,
  exerciseGroup,
  exerciseNames,
  onEndCountdown,
  onSkipCountdown,
  onStartCountdown,
  recordedSetDraftEntries,
  workoutExerciseDrafts,
}: {
  countdown: Countdown | null;
  dispatch: (action: RecordedSetDraftsAction) => void;
  dispatchWorkoutExerciseDrafts: (action: WorkoutExerciseDraftsAction) => void;
  exerciseGroup: Workout["sections"][keyof Workout["sections"]][number];
  exerciseNames: Map<string, string>;
  onEndCountdown: () => void;
  onSkipCountdown: () => void;
  onStartCountdown: (countdown: Omit<Countdown, "startTime">) => void;
  recordedSetDraftEntries: readonly RecordedSetDraftEntry[];
  workoutExerciseDrafts: WorkoutExerciseDrafts;
}) {
  return (
    <>
      {exerciseGroup.exercises.length >= MINIMUM_SUPERSET_EXERCISE_COUNT ? (
        <Text>{SHARED_MESSAGES.supersetLabel}</Text>
      ) : null}
      {exerciseGroup.exercises.map((workoutExercise, index) => (
        <Fragment key={workoutExercise.id}>
          {"warmUpExercises" in workoutExercise
            ? workoutExercise.warmUpExercises.map((warmUpWorkoutExercise) => (
                <WorkoutExercise
                  canStartRest
                  countdown={countdown}
                  dispatch={dispatch}
                  dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
                  exerciseNames={exerciseNames}
                  key={warmUpWorkoutExercise.id}
                  onEndCountdown={onEndCountdown}
                  onSkipCountdown={onSkipCountdown}
                  onStartCountdown={onStartCountdown}
                  recordedSetDraftEntries={recordedSetDraftEntries}
                  warmUpForExerciseName={
                    exerciseNames.get(workoutExercise.exerciseId) ?? ""
                  }
                  workoutExercise={warmUpWorkoutExercise}
                  workoutExerciseDrafts={workoutExerciseDrafts}
                />
              ))
            : null}
          <WorkoutExercise
            canStartRest={index === exerciseGroup.exercises.length - 1}
            countdown={countdown}
            dispatch={dispatch}
            dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
            exerciseNames={exerciseNames}
            onEndCountdown={onEndCountdown}
            onSkipCountdown={onSkipCountdown}
            onStartCountdown={onStartCountdown}
            recordedSetDraftEntries={recordedSetDraftEntries}
            workoutExercise={workoutExercise}
            workoutExerciseDrafts={workoutExerciseDrafts}
          />
        </Fragment>
      ))}
    </>
  );
}
