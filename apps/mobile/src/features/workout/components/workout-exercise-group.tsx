import { Fragment } from "react";

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

export function WorkoutExerciseGroup({
  dispatch,
  dispatchWorkoutExerciseDrafts,
  exerciseGroup,
  exerciseNames,
  recordedSetDraftEntries,
  workoutExerciseDrafts,
}: {
  dispatch: (action: RecordedSetDraftsAction) => void;
  dispatchWorkoutExerciseDrafts: (action: WorkoutExerciseDraftsAction) => void;
  exerciseGroup: Workout["sections"][keyof Workout["sections"]][number];
  exerciseNames: Map<string, string>;
  recordedSetDraftEntries: readonly RecordedSetDraftEntry[];
  workoutExerciseDrafts: WorkoutExerciseDrafts;
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
                  dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
                  exerciseNames={exerciseNames}
                  key={warmUpWorkoutExercise.id}
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
            dispatch={dispatch}
            dispatchWorkoutExerciseDrafts={dispatchWorkoutExerciseDrafts}
            exerciseNames={exerciseNames}
            recordedSetDraftEntries={recordedSetDraftEntries}
            workoutExercise={workoutExercise}
            workoutExerciseDrafts={workoutExerciseDrafts}
          />
        </Fragment>
      ))}
    </>
  );
}
