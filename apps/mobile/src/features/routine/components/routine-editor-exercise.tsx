import type { ReactNode } from "react";

import type {
  RoutineDraftAction,
  RoutineExerciseDraft,
} from "#/features/routine/core/routine-draft-reducer.ts";

import { RoutineEditorSet } from "#/features/routine/components/routine-editor-set.tsx";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { useCreateId } from "#/shared/hooks/use-create-id.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

/**
 * Edits one Routine exercise, with `children` for the actions that only some
 * Routine exercises have, such as adding a Warm-up exercise.
 */
export function RoutineEditorExercise({
  children,
  dispatch,
  exerciseName,
  hasSubmitted,
  routineExercise,
  warmUpForExerciseName,
}: {
  children?: ReactNode;
  dispatch: (action: RoutineDraftAction) => void;
  exerciseName: string;
  hasSubmitted: boolean;
  routineExercise: RoutineExerciseDraft;
  warmUpForExerciseName?: string;
}) {
  const createId = useCreateId();

  function handleAddSet() {
    dispatch({
      routineExerciseId: routineExercise.id,
      setId: createId(),
      type: "addedSet",
    });
  }

  return (
    <>
      <Text>{exerciseName}</Text>
      {warmUpForExerciseName === undefined ? null : (
        <Text>
          {SHARED_MESSAGES.warmUpForExerciseLabel(warmUpForExerciseName)}
        </Text>
      )}
      <TextField
        errorMessage={null}
        label={ROUTINE_MESSAGES.exerciseNoteLabel}
        multiline
        onChangeText={(note) => {
          dispatch({
            note,
            routineExerciseId: routineExercise.id,
            type: "changedExerciseNote",
          });
        }}
        value={routineExercise.note}
      />
      {routineExercise.sets.map((set, setIndex) => (
        <RoutineEditorSet
          dispatch={dispatch}
          hasSubmitted={hasSubmitted}
          key={set.id}
          routineExerciseId={routineExercise.id}
          set={set}
          setNumber={setIndex + 1}
        />
      ))}
      <Button onPress={handleAddSet} title={ROUTINE_MESSAGES.addSetButton} />
      {children}
      <Button
        onPress={() => {
          dispatch({
            routineExerciseId: routineExercise.id,
            type: "removedExercise",
          });
        }}
        title={ROUTINE_MESSAGES.removeExerciseButton}
      />
    </>
  );
}
