import { WEIGHT_UNITS } from "@ankaa/core/features/workout/constants/weight";
import { useState } from "react";

import type { WorkoutExercise as WorkoutExerciseValue } from "#/shared/workout.ts";

import { WorkoutExerciseNote } from "#/features/workout/components/workout-exercise-note.tsx";
import { WorkoutExerciseSkip } from "#/features/workout/components/workout-exercise-skip.tsx";
import { WorkoutSet } from "#/features/workout/components/workout-set.tsx";
import { getWorkingSetCounts } from "#/features/workout/core/get-working-set-counts.ts";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { PickerField } from "#/shared/components/picker-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

/**
 * Shows a Workout exercise with a row for each planned Set, since it records
 * no more Sets than it plans, whose weights are entered in the Weight unit
 * that the User picks for the Workout exercise.
 */
export function WorkoutExercise({
  canStartRest,
  exerciseName,
  warmUpForExerciseName,
  workoutExercise,
}: {
  canStartRest: boolean;
  exerciseName: string;
  warmUpForExerciseName?: string;
  workoutExercise: WorkoutExerciseValue;
}) {
  const workoutContext = useWorkoutContext();

  const [weightUnit, setWeightUnit] = useState(workoutExercise.weightUnit);

  const workingSetCounts = getWorkingSetCounts({
    plannedSets: workoutExercise.plannedSets,
    recordedSetCount: workoutExercise.recordedSets.length,
  });

  return (
    <>
      <Text>{exerciseName}</Text>
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
      {workoutExercise.weightType === "none" ? null : (
        <Text>
          {WORKOUT_MESSAGES.weightTypeDescriptions[workoutExercise.weightType]}
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
      {workoutExercise.plannedSets.map((plannedSet, position) => (
        <WorkoutSet
          amountUnit={workoutExercise.amountUnit}
          canStartRest={canStartRest}
          draft={
            workoutContext.drafts.recordedSets.find(
              (entry) =>
                entry.workoutExerciseId === workoutExercise.id &&
                entry.position === position,
            )?.draft ?? null
          }
          exerciseId={workoutExercise.exerciseId}
          isRecordable={position <= workoutExercise.recordedSets.length}
          key={position}
          plannedSet={plannedSet}
          position={position}
          recordedSet={workoutExercise.recordedSets[position] ?? null}
          weightType={workoutExercise.weightType}
          weightUnit={weightUnit}
          workoutExerciseId={workoutExercise.id}
        />
      ))}
      <WorkoutExerciseNote
        draft={
          workoutContext.drafts.notes.find(
            (entry) => entry.workoutExerciseId === workoutExercise.id,
          )?.draft ?? null
        }
        exerciseId={workoutExercise.exerciseId}
        note={workoutExercise.note}
        workoutExerciseId={workoutExercise.id}
      />
      <WorkoutExerciseSkip
        draft={
          workoutContext.drafts.skips.find(
            (entry) => entry.workoutExerciseId === workoutExercise.id,
          )?.draft ?? null
        }
        exerciseId={workoutExercise.exerciseId}
        note={workoutExercise.skipNote}
        reason={workoutExercise.skipReason}
        workoutExerciseId={workoutExercise.id}
      />
    </>
  );
}
