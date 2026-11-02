import type { ReactNode } from "react";

import { PYRAMID_LABELS } from "@ankaa/core/shared/constants/pyramid-labels";

import type {
  RoutineDraftAction,
  RoutineExerciseDraft,
} from "#/features/routine/core/routine-draft-reducer.ts";

import { RoutineEditorSet } from "#/features/routine/components/routine-editor-set.tsx";
import { routineExerciseFormSchema } from "#/features/routine/core/routine-exercise-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { PickerField } from "#/shared/components/picker-field.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useCreateId } from "#/shared/hooks/use-create-id.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const NO_PYRAMID_LABEL = "none";

const PYRAMID_LABEL_OPTIONS = [NO_PYRAMID_LABEL, ...PYRAMID_LABELS] as const;

const PYRAMID_LABEL_OPTION_LABELS = {
  ...SHARED_MESSAGES.pyramidLabelLabels,
  [NO_PYRAMID_LABEL]: ROUTINE_MESSAGES.noPyramidLabelLabel,
};

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

  const routineExerciseFormDecoding = decodeForm({
    hasSubmitted,
    schema: routineExerciseFormSchema,
    values: routineExercise,
  });

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
      <PickerField
        label={ROUTINE_MESSAGES.pyramidLabelLabel}
        onChangeSelectedOption={(pyramidLabelOption) => {
          dispatch({
            pyramidLabel:
              pyramidLabelOption === NO_PYRAMID_LABEL
                ? null
                : pyramidLabelOption,
            routineExerciseId: routineExercise.id,
            type: "changedPyramidLabel",
          });
        }}
        optionLabels={PYRAMID_LABEL_OPTION_LABELS}
        options={PYRAMID_LABEL_OPTIONS}
        selectedOption={routineExercise.pyramidLabel ?? NO_PYRAMID_LABEL}
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
      {routineExerciseFormDecoding.errorMessage === null ? null : (
        <Text>{routineExerciseFormDecoding.errorMessage}</Text>
      )}
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
