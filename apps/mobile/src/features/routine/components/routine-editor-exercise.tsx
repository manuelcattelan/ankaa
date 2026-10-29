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
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { createId } from "#/shared/interactors/create-id.ts";

/**
 * Edits one Routine exercise, with `children` for the actions that only some
 * Routine exercises have, such as adding a Warm-up exercise.
 */
export function RoutineEditorExercise({
  children,
  dispatch,
  exerciseNames,
  hasSubmitted,
  routineExercise,
  warmUpForExerciseName,
}: {
  children?: ReactNode;
  dispatch: (action: RoutineDraftAction) => void;
  exerciseNames: Map<string, string>;
  hasSubmitted: boolean;
  routineExercise: RoutineExerciseDraft;
  warmUpForExerciseName?: string;
}) {
  const runtime = useRuntime();

  function handleAddSet() {
    dispatch({
      routineExerciseId: routineExercise.id,
      setId: runtime.runSync(createId()),
      type: "addedSet",
    });
  }

  return (
    <>
      <Text>{exerciseNames.get(routineExercise.exerciseId)}</Text>
      {warmUpForExerciseName === undefined ? null : (
        <Text>
          {ROUTINE_MESSAGES.warmUpForExerciseLabel(warmUpForExerciseName)}
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
