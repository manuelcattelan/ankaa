import { SET_TYPES } from "@ankaa/core/shared/constants/set-types";
import { Host, Switch } from "@expo/ui";

import type { RoutineDraftAction } from "#/features/routine/core/routine-draft-reducer.ts";
import type { RoutineExerciseSetDraft } from "#/features/routine/core/routine-exercise-set-form-schema.ts";

import { RoutineEditorDropSet } from "#/features/routine/components/routine-editor-drop-set.tsx";
import { RoutineEditorRestPauseSet } from "#/features/routine/components/routine-editor-rest-pause-set.tsx";
import { routineExerciseSetFormSchema } from "#/features/routine/core/routine-exercise-set-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { Button } from "#/shared/components/button.tsx";
import { PickerField } from "#/shared/components/picker-field.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { Text } from "#/shared/components/text.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const INTENSITY_TECHNIQUE_OPTIONS = [
  "none",
  "DropSet",
  "RestPauseSet",
] as const;

const EMPTY_INTENSITY_TECHNIQUE_DRAFTS = {
  DropSet: { _tag: "DropSet", segmentCount: "", weightPercentage: "" },
  none: null,
  RestPauseSet: { _tag: "RestPauseSet", pauseSeconds: "", segmentCount: "" },
} satisfies Record<
  (typeof INTENSITY_TECHNIQUE_OPTIONS)[number],
  RoutineExerciseSetDraft["intensityTechnique"]
>;

export function RoutineEditorSet({
  dispatch,
  hasSubmitted,
  routineExerciseId,
  set,
  setNumber,
}: {
  dispatch: (action: RoutineDraftAction) => void;
  hasSubmitted: boolean;
  routineExerciseId: string;
  set: RoutineExerciseSetDraft;
  setNumber: number;
}) {
  const setFormDecoding = decodeForm({
    schema: routineExerciseSetFormSchema,
    values: set,
  });
  const amountErrorMessage = hasSubmitted
    ? setFormDecoding.errorMessages.amount
    : null;
  const restSecondsErrorMessage = hasSubmitted
    ? setFormDecoding.errorMessages.restSeconds
    : null;
  const tempoErrorMessage = hasSubmitted
    ? setFormDecoding.errorMessages.tempo
    : null;

  function handleChangeSet(setChanges: Partial<RoutineExerciseSetDraft>) {
    dispatch({
      routineExerciseId,
      set: { ...set, ...setChanges },
      type: "changedSet",
    });
  }

  return (
    <>
      <Text>{SHARED_MESSAGES.setLabel(setNumber)}</Text>
      <PickerField
        label={ROUTINE_MESSAGES.setTypeLabel}
        onChangeSelectedOption={(type) => {
          handleChangeSet({ type });
        }}
        optionLabels={ROUTINE_MESSAGES.setTypeLabels}
        options={SET_TYPES}
        selectedOption={set.type}
      />
      <TextField
        errorMessage={amountErrorMessage}
        inputMode="numeric"
        label={ROUTINE_MESSAGES.amountLabel}
        onChangeText={(amount) => {
          handleChangeSet({ amount });
        }}
        value={set.amount}
      />
      <TextField
        errorMessage={restSecondsErrorMessage}
        inputMode="numeric"
        label={ROUTINE_MESSAGES.restSecondsLabel}
        onChangeText={(restSeconds) => {
          handleChangeSet({ restSeconds });
        }}
        value={set.restSeconds}
      />
      <TextField
        autoCapitalize="characters"
        autoCorrect={false}
        errorMessage={tempoErrorMessage}
        label={ROUTINE_MESSAGES.tempoLabel}
        onChangeText={(tempo) => {
          handleChangeSet({ tempo });
        }}
        value={set.tempo}
      />
      <Host matchContents>
        <Switch
          label={ROUTINE_MESSAGES.toFailureLabel}
          onValueChange={(isToFailure) => {
            handleChangeSet({ isToFailure });
          }}
          value={set.isToFailure}
        />
      </Host>
      <PickerField
        label={ROUTINE_MESSAGES.intensityTechniqueLabel}
        onChangeSelectedOption={(intensityTechniqueOption) => {
          handleChangeSet({
            intensityTechnique:
              EMPTY_INTENSITY_TECHNIQUE_DRAFTS[intensityTechniqueOption],
          });
        }}
        optionLabels={ROUTINE_MESSAGES.intensityTechniqueLabels}
        options={INTENSITY_TECHNIQUE_OPTIONS}
        selectedOption={set.intensityTechnique?._tag ?? "none"}
      />
      {set.intensityTechnique?._tag === "DropSet" ? (
        <RoutineEditorDropSet
          dropSet={set.intensityTechnique}
          hasSubmitted={hasSubmitted}
          onChangeDropSet={(dropSet) => {
            handleChangeSet({ intensityTechnique: dropSet });
          }}
        />
      ) : null}
      {set.intensityTechnique?._tag === "RestPauseSet" ? (
        <RoutineEditorRestPauseSet
          hasSubmitted={hasSubmitted}
          onChangeRestPauseSet={(restPauseSet) => {
            handleChangeSet({ intensityTechnique: restPauseSet });
          }}
          restPauseSet={set.intensityTechnique}
        />
      ) : null}
      <Button
        onPress={() => {
          dispatch({
            routineExerciseId,
            setId: set.id,
            type: "removedSet",
          });
        }}
        title={ROUTINE_MESSAGES.removeSetButton}
      />
    </>
  );
}
