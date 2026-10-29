import { WEIGHT_UNITS } from "@ankaa/core/features/workout/constants/weight";
import { getMatchingPlannedSet } from "@ankaa/core/features/workout/get-matching-planned-set";
import { useState } from "react";

import type {
  RecordedSetDraftEntry,
  RecordedSetDraftsAction,
} from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import type {
  WorkoutExerciseDrafts,
  WorkoutExerciseDraftsAction,
} from "#/features/workout/core/workout-exercise-drafts-reducer.ts";
import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutExerciseNote } from "#/features/workout/components/workout-exercise-note.tsx";
import { WorkoutExerciseSkip } from "#/features/workout/components/workout-exercise-skip.tsx";
import { WorkoutSet } from "#/features/workout/components/workout-set.tsx";
import { getWorkingSetCounts } from "#/features/workout/core/get-working-set-counts.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { PickerField } from "#/shared/components/picker-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

/**
 * Shows a Workout exercise with a row for each planned Set, each recorded
 * Set, and the next Set to record, whose weights are entered in the Weight
 * unit that the User picks for the Workout exercise.
 */
export function WorkoutExercise({
  dispatch,
  dispatchWorkoutExerciseDrafts,
  exerciseNames,
  recordedSetDraftEntries,
  warmUpForExerciseName,
  workoutExercise,
  workoutExerciseDrafts,
}: {
  dispatch: (action: RecordedSetDraftsAction) => void;
  dispatchWorkoutExerciseDrafts: (action: WorkoutExerciseDraftsAction) => void;
  exerciseNames: Map<string, string>;
  recordedSetDraftEntries: readonly RecordedSetDraftEntry[];
  warmUpForExerciseName?: string;
  workoutExercise: Workout["sections"]["coolDown"][number]["exercises"][number];
  workoutExerciseDrafts: WorkoutExerciseDrafts;
}) {
  const [weightUnit, setWeightUnit] = useState(workoutExercise.weightUnit);

  const workingSetCounts = getWorkingSetCounts({
    plannedSets: workoutExercise.plannedSets,
    recordedSetCount: workoutExercise.recordedSets.length,
  });
  const setCount = Math.max(
    workoutExercise.plannedSets.length,
    workoutExercise.recordedSets.length + 1,
  );
  const positions = Array.from(
    { length: setCount },
    (value, position) => position,
  );

  return (
    <>
      <Text>{exerciseNames.get(workoutExercise.exerciseId)}</Text>
      {warmUpForExerciseName === undefined ? null : (
        <Text>
          {SHARED_MESSAGES.warmUpForExerciseLabel(warmUpForExerciseName)}
        </Text>
      )}
      {workoutExercise.plannedNote === null ? null : (
        <Text>
          {WORKOUT_MESSAGES.plannedNoteLabel(workoutExercise.plannedNote)}
        </Text>
      )}
      <Text>{WORKOUT_MESSAGES.workingSetCounterStatus(workingSetCounts)}</Text>
      {workoutExercise.weightType === "none" ? null : (
        <PickerField
          label={WORKOUT_MESSAGES.weightUnitLabel}
          onChangeSelectedOption={setWeightUnit}
          optionLabels={WORKOUT_MESSAGES.weightUnitLabels}
          options={WEIGHT_UNITS}
          selectedOption={weightUnit}
        />
      )}
      {positions.map((position) => (
        <WorkoutSet
          amountUnit={workoutExercise.amountUnit}
          dispatch={dispatch}
          draft={
            recordedSetDraftEntries.find(
              (entry) =>
                entry.workoutExerciseId === workoutExercise.id &&
                entry.position === position,
            )?.draft ?? null
          }
          exerciseId={workoutExercise.exerciseId}
          isRecordable={position <= workoutExercise.recordedSets.length}
          isRemovable={position === workoutExercise.recordedSets.length - 1}
          key={position}
          plannedSet={{
            ...getMatchingPlannedSet({
              plannedSets: workoutExercise.plannedSets,
              position,
            }),
            amount: workoutExercise.plannedSets[position]?.amount ?? null,
            restSeconds:
              workoutExercise.plannedSets[position]?.restSeconds ?? null,
          }}
          position={position}
          recordedSet={workoutExercise.recordedSets[position] ?? null}
          weightType={workoutExercise.weightType}
          weightUnit={weightUnit}
          workoutExerciseId={workoutExercise.id}
        />
      ))}
      <WorkoutExerciseNote
        dispatch={dispatchWorkoutExerciseDrafts}
        draft={
          workoutExerciseDrafts.notes.find(
            (entry) => entry.workoutExerciseId === workoutExercise.id,
          )?.draft ?? null
        }
        exerciseId={workoutExercise.exerciseId}
        note={workoutExercise.note}
        workoutExerciseId={workoutExercise.id}
      />
      <WorkoutExerciseSkip
        dispatch={dispatchWorkoutExerciseDrafts}
        draft={
          workoutExerciseDrafts.skips.find(
            (entry) => entry.workoutExerciseId === workoutExercise.id,
          )?.draft ?? null
        }
        exerciseId={workoutExercise.exerciseId}
        skipReason={workoutExercise.skipReason}
        skipReasonNote={workoutExercise.skipReasonNote}
        workoutExerciseId={workoutExercise.id}
      />
    </>
  );
}
