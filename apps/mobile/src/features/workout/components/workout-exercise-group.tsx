import { Fragment } from "react";

import type {
  RecordedSetDraftEntry,
  RecordedSetDraftsAction,
} from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutExercise } from "#/features/workout/components/workout-exercise.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const MINIMUM_SUPERSET_EXERCISE_COUNT = 2;

export function WorkoutExerciseGroup({
  dispatch,
  exerciseGroup,
  exerciseNames,
  recordedSetDraftEntries,
}: {
  dispatch: (action: RecordedSetDraftsAction) => void;
  exerciseGroup: Workout["sections"][keyof Workout["sections"]][number];
  exerciseNames: Map<string, string>;
  recordedSetDraftEntries: readonly RecordedSetDraftEntry[];
}) {
  return (
    <>
      {exerciseGroup.exercises.length >= MINIMUM_SUPERSET_EXERCISE_COUNT ? (
        <Text>{SHARED_MESSAGES.supersetLabel}</Text>
      ) : null}
      {exerciseGroup.exercises.map((workoutExercise) => (
        <Fragment key={workoutExercise.id}>
          {"warmUpExercises" in workoutExercise
            ? workoutExercise.warmUpExercises.map((warmUpWorkoutExercise) => (
                <WorkoutExercise
                  dispatch={dispatch}
                  exerciseNames={exerciseNames}
                  key={warmUpWorkoutExercise.id}
                  recordedSetDraftEntries={recordedSetDraftEntries}
                  warmUpForExerciseName={
                    exerciseNames.get(workoutExercise.exerciseId) ?? ""
                  }
                  workoutExercise={warmUpWorkoutExercise}
                />
              ))
            : null}
          <WorkoutExercise
            dispatch={dispatch}
            exerciseNames={exerciseNames}
            recordedSetDraftEntries={recordedSetDraftEntries}
            workoutExercise={workoutExercise}
          />
        </Fragment>
      ))}
    </>
  );
}
