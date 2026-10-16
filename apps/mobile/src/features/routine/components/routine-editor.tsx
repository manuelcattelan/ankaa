import type { DayOfWeek } from "@ankaa/core/features/routine/constants/day-of-week";
import type { Variation } from "@ankaa/core/shared/constants/intensity-technique";
import type { Section } from "@ankaa/core/shared/constants/section";
import type { SetType } from "@ankaa/core/shared/constants/set-type";
import type { SnapPoint } from "@expo/ui";
import type { ReactElement } from "react";

import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/day-of-week";
import { VARIATIONS } from "@ankaa/core/shared/constants/intensity-technique";
import { SECTIONS } from "@ankaa/core/shared/constants/section";
import { SET_TYPES } from "@ankaa/core/shared/constants/set-type";
import { BottomSheet, Host, RNHostView, Switch } from "@expo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useReducer, useState } from "react";

import type {
  RoutineDraftAction,
  RoutineDraftBlock,
  RoutineDraftBlockMoveDirection,
  RoutineDraftExercise,
  RoutineDraftExerciseSet,
  RoutineDraftWarmUpExercise,
} from "@/features/routine/core/routine-draft-reducer";
import type { Routine } from "@/features/routine/interactors/list-routines";
import type { Exercise } from "@/shared/interactors/list-exercises";

import { MAIN_SECTION } from "@/features/routine/constants/section";
import { SUPERSET_EXERCISE_COUNT_MINIMUM } from "@/features/routine/constants/superset";
import { buildRoutineSaveInput } from "@/features/routine/core/build-routine-save-input";
import { createRoutineDraft } from "@/features/routine/core/create-routine-draft";
import { getRoutineDraftExerciseSetValidationErrors } from "@/features/routine/core/get-routine-draft-exercise-set-validation-errors";
import { getRoutineNameValidationError } from "@/features/routine/core/get-routine-name-validation-error";
import { getRoutineSaveErrorMessage } from "@/features/routine/core/get-routine-save-error-message";
import { hasRoutineDraftValidationErrors } from "@/features/routine/core/has-routine-draft-validation-errors";
import { routineDraftReducer } from "@/features/routine/core/routine-draft-reducer";
import { routineEditorMessages } from "@/features/routine/messages/routine-editor-messages";
import { createRoutineDeleteMutationOptions } from "@/features/routine/mutations/create-routine-delete-mutation-options";
import { createRoutineSaveMutationOptions } from "@/features/routine/mutations/create-routine-save-mutation-options";
import { createRoutineListQueryOptions } from "@/features/routine/queries/create-routine-list-query-options";
import { Button } from "@/shared/components/button";
import { CheckboxGroup } from "@/shared/components/checkbox-group";
import { PickerField } from "@/shared/components/picker-field";
import { ScrollView } from "@/shared/components/scroll-view";
import { StatusMessage } from "@/shared/components/status-message";
import { Text } from "@/shared/components/text";
import { TextField } from "@/shared/components/text-field";
import { getTrpcErrorMessage } from "@/shared/core/get-trpc-error-message";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";
import { createIdentifier } from "@/shared/interactors/create-identifier";
import { createExerciseListQueryOptions } from "@/shared/queries/create-exercise-list-query-options";

type ExercisePickerTarget =
  { section: Section } | { warmUpForRoutineExerciseId: string };

type RoutineEditorBlockProperties = RoutineEditorSharedProperties & {
  isFirstRoutineDraftBlock: boolean;
  isLastRoutineDraftBlock: boolean;
  routineDraftBlock: RoutineDraftBlock;
  section: Section;
};

type RoutineEditorExerciseProperties = RoutineEditorSharedProperties & {
  onAddWarmUpExercise?: () => void;
  onLeaveSuperset?: () => void;
  routineDraftExercise: RoutineDraftExercise;
  warmUpForExerciseName?: string;
};

type RoutineEditorProperties = {
  renderExercisePicker: (
    onSelectExercise: (exercise: Exercise) => void,
  ) => ReactElement;
  routine?: Routine;
};

type RoutineEditorSectionProperties = RoutineEditorSharedProperties & {
  routineDraftBlocks: RoutineDraftBlock[];
  section: Section;
};

type RoutineEditorSetProperties = {
  dispatchRoutineDraftAction: (routineDraftAction: RoutineDraftAction) => void;
  routineDraftExerciseSet: RoutineDraftExerciseSet;
  routineExerciseId: string;
  setNumber: number;
  shouldShowValidationErrors: boolean;
};

type RoutineEditorSharedProperties = {
  dispatchRoutineDraftAction: (routineDraftAction: RoutineDraftAction) => void;
  exerciseNames: Map<string, string>;
  onOpenExercisePicker: (exercisePickerTarget: ExercisePickerTarget) => void;
  shouldShowValidationErrors: boolean;
};

type VariationPickerOption = typeof NO_VARIATION_PICKER_OPTION | Variation;

const NO_VARIATION_PICKER_OPTION = "none";

const EXERCISE_PICKER_SNAP_POINTS: SnapPoint[] = ["full"];

const DAY_OF_WEEK_LABELS = {
  friday: routineEditorMessages.fridayDayLabel,
  monday: routineEditorMessages.mondayDayLabel,
  saturday: routineEditorMessages.saturdayDayLabel,
  sunday: routineEditorMessages.sundayDayLabel,
  thursday: routineEditorMessages.thursdayDayLabel,
  tuesday: routineEditorMessages.tuesdayDayLabel,
  wednesday: routineEditorMessages.wednesdayDayLabel,
} satisfies Record<DayOfWeek, string>;

const SECTION_LABELS = {
  cool_down: routineEditorMessages.coolDownSectionLabel,
  main: routineEditorMessages.mainSectionLabel,
  warm_up: routineEditorMessages.warmUpSectionLabel,
} satisfies Record<Section, string>;

const SET_TYPE_LABELS = {
  warm_up: routineEditorMessages.warmUpSetTypeLabel,
  working: routineEditorMessages.workingSetTypeLabel,
} satisfies Record<SetType, string>;

const VARIATION_PICKER_LABELS = {
  drop_set: routineEditorMessages.dropSetVariationLabel,
  none: routineEditorMessages.noVariationLabel,
  rest_pause: routineEditorMessages.restPauseVariationLabel,
} satisfies Record<VariationPickerOption, string>;

const VARIATION_PICKER_OPTIONS: VariationPickerOption[] = [
  NO_VARIATION_PICKER_OPTION,
  ...VARIATIONS,
];

export function RoutineEditor({
  renderExercisePicker,
  routine,
}: RoutineEditorProperties) {
  const runtime = useRuntime();

  const router = useRouter();

  const queryClient = useQueryClient();

  const [routineDraft, dispatchRoutineDraftAction] = useReducer(
    routineDraftReducer,
    routine,
    createRoutineDraft,
  );

  const [exercisePickerTarget, setExercisePickerTarget] =
    useState<ExercisePickerTarget>();
  const [shouldShowValidationErrors, setShouldShowValidationErrors] =
    useState(false);

  const exerciseLibrary = useQuery(createExerciseListQueryOptions(runtime));

  const saveRoutine = useMutation({
    ...createRoutineSaveMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceMessage(getRoutineSaveErrorMessage(error)));
    },
    onSuccess: showUpdatedRoutineList,
  });

  const deleteRoutine = useMutation({
    ...createRoutineDeleteMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceMessage(getTrpcErrorMessage(error)));
    },
    onSuccess: showUpdatedRoutineList,
  });

  const exerciseNames = new Map(
    exerciseLibrary.data?.map(
      (exercise) => [exercise.id, exercise.name] as const,
    ),
  );
  const isRoutineChangePending =
    saveRoutine.isPending || deleteRoutine.isPending;
  const isRoutineDraftInvalid =
    shouldShowValidationErrors && hasRoutineDraftValidationErrors(routineDraft);
  const routineNameValidationError = shouldShowValidationErrors
    ? getRoutineNameValidationError(routineDraft.name)
    : undefined;
  const routineChangeErrorMessage = getRoutineChangeErrorMessage();

  function getRoutineChangeErrorMessage() {
    if (saveRoutine.error) {
      return getRoutineSaveErrorMessage(saveRoutine.error);
    }

    if (deleteRoutine.error) {
      return getTrpcErrorMessage(deleteRoutine.error);
    }

    return isRoutineDraftInvalid
      ? routineEditorMessages.routineDraftInvalidError
      : undefined;
  }

  function handleChangeDays(days: DayOfWeek[]) {
    dispatchRoutineDraftAction({ days, type: "changedDays" });
  }

  function handleChangeName(name: string) {
    dispatchRoutineDraftAction({ name, type: "changedName" });
  }

  function handleDeleteRoutine() {
    if (isRoutineChangePending || routineDraft.id === undefined) {
      return;
    }

    saveRoutine.reset();

    deleteRoutine.mutate({ id: routineDraft.id });
  }

  function handleDismissExercisePicker() {
    setExercisePickerTarget(undefined);
  }

  function handleSaveRoutine() {
    if (isRoutineChangePending) {
      return;
    }

    setShouldShowValidationErrors(true);
    saveRoutine.reset();
    deleteRoutine.reset();

    if (hasRoutineDraftValidationErrors(routineDraft)) {
      runtime.runSync(
        announceMessage(routineEditorMessages.routineDraftInvalidError),
      );

      return;
    }

    const routineId = routineDraft.id ?? runtime.runSync(createIdentifier());

    dispatchRoutineDraftAction({ id: routineId, type: "assignedId" });

    saveRoutine.mutate(buildRoutineSaveInput({ routineDraft, routineId }));
  }

  function handleSelectExercise(exercise: Exercise) {
    if (!exercisePickerTarget) {
      return;
    }

    if ("section" in exercisePickerTarget) {
      dispatchRoutineDraftAction({
        exerciseId: exercise.id,
        routineDraftBlockId: runtime.runSync(createIdentifier()),
        routineExerciseId: runtime.runSync(createIdentifier()),
        section: exercisePickerTarget.section,
        type: "addedExercise",
      });
    } else {
      dispatchRoutineDraftAction({
        exerciseId: exercise.id,
        routineExerciseId: runtime.runSync(createIdentifier()),
        type: "addedWarmUpExercise",
        warmUpForRoutineExerciseId:
          exercisePickerTarget.warmUpForRoutineExerciseId,
      });
    }

    setExercisePickerTarget(undefined);
  }

  function showUpdatedRoutineList() {
    void queryClient.invalidateQueries({
      queryKey: createRoutineListQueryOptions(runtime).queryKey,
    });

    router.dismissTo("/");
  }

  return (
    <>
      <ScrollView>
        <TextField
          errorMessage={routineNameValidationError}
          label={routineEditorMessages.routineNameLabel}
          onChangeText={handleChangeName}
          value={routineDraft.name}
        />
        <CheckboxGroup
          label={routineEditorMessages.daysLabel}
          onChangeSelectedOptions={handleChangeDays}
          optionLabels={DAY_OF_WEEK_LABELS}
          options={DAYS_OF_WEEK}
          selectedOptions={routineDraft.days}
        />
        {SECTIONS.map((section) => (
          <RoutineEditorSection
            dispatchRoutineDraftAction={dispatchRoutineDraftAction}
            exerciseNames={exerciseNames}
            key={section}
            onOpenExercisePicker={setExercisePickerTarget}
            routineDraftBlocks={routineDraft.sections[section]}
            section={section}
            shouldShowValidationErrors={shouldShowValidationErrors}
          />
        ))}
        <Button
          isBusy={saveRoutine.isPending}
          onPress={handleSaveRoutine}
          title={routineEditorMessages.saveRoutineButton}
        />
        {routine ? (
          <Button
            isBusy={deleteRoutine.isPending}
            onPress={handleDeleteRoutine}
            title={routineEditorMessages.deleteRoutineButton}
          />
        ) : null}
        <StatusMessage message={routineChangeErrorMessage} />
      </ScrollView>
      <BottomSheet
        isPresented={!!exercisePickerTarget}
        onDismiss={handleDismissExercisePicker}
        snapPoints={EXERCISE_PICKER_SNAP_POINTS}
      >
        <RNHostView>{renderExercisePicker(handleSelectExercise)}</RNHostView>
      </BottomSheet>
    </>
  );
}

function RoutineEditorBlock({
  dispatchRoutineDraftAction,
  exerciseNames,
  isFirstRoutineDraftBlock,
  isLastRoutineDraftBlock,
  onOpenExercisePicker,
  routineDraftBlock,
  section,
  shouldShowValidationErrors,
}: RoutineEditorBlockProperties) {
  const runtime = useRuntime();

  const isSuperset =
    routineDraftBlock.exercises.length >= SUPERSET_EXERCISE_COUNT_MINIMUM;

  function getWarmUpForExerciseName(
    routineDraftWarmUpExercise: RoutineDraftWarmUpExercise,
  ) {
    const warmUpForRoutineDraftExercise = routineDraftBlock.exercises.find(
      (routineDraftExercise) =>
        routineDraftExercise.id ===
        routineDraftWarmUpExercise.warmUpForRoutineExerciseId,
    );

    return (
      exerciseNames.get(warmUpForRoutineDraftExercise?.exerciseId ?? "") ?? ""
    );
  }

  function handleJoinSupersetWithNextBlock() {
    dispatchRoutineDraftAction({
      routineDraftBlockId: routineDraftBlock.id,
      section,
      type: "joinedSupersetWithNextBlock",
    });
  }

  function handleMoveBlock(
    routineDraftBlockMoveDirection: RoutineDraftBlockMoveDirection,
  ) {
    dispatchRoutineDraftAction({
      routineDraftBlockId: routineDraftBlock.id,
      routineDraftBlockMoveDirection,
      section,
      type: "movedBlock",
    });
  }

  return (
    <>
      {isSuperset ? <Text>{routineEditorMessages.supersetLabel}</Text> : null}
      {routineDraftBlock.warmUpExercises.map((routineDraftWarmUpExercise) => (
        <RoutineEditorExercise
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          exerciseNames={exerciseNames}
          key={routineDraftWarmUpExercise.id}
          onOpenExercisePicker={onOpenExercisePicker}
          routineDraftExercise={routineDraftWarmUpExercise}
          shouldShowValidationErrors={shouldShowValidationErrors}
          warmUpForExerciseName={getWarmUpForExerciseName(
            routineDraftWarmUpExercise,
          )}
        />
      ))}
      {routineDraftBlock.exercises.map((routineDraftExercise) => (
        <RoutineEditorExercise
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          exerciseNames={exerciseNames}
          key={routineDraftExercise.id}
          onAddWarmUpExercise={
            section === MAIN_SECTION
              ? () => {
                  onOpenExercisePicker({
                    warmUpForRoutineExerciseId: routineDraftExercise.id,
                  });
                }
              : undefined
          }
          onLeaveSuperset={
            isSuperset
              ? () => {
                  dispatchRoutineDraftAction({
                    routineDraftBlockId: runtime.runSync(createIdentifier()),
                    routineExerciseId: routineDraftExercise.id,
                    section,
                    type: "leftSuperset",
                  });
                }
              : undefined
          }
          onOpenExercisePicker={onOpenExercisePicker}
          routineDraftExercise={routineDraftExercise}
          shouldShowValidationErrors={shouldShowValidationErrors}
        />
      ))}
      <Button
        disabled={isFirstRoutineDraftBlock}
        onPress={() => {
          handleMoveBlock("up");
        }}
        title={routineEditorMessages.moveUpButton}
      />
      <Button
        disabled={isLastRoutineDraftBlock}
        onPress={() => {
          handleMoveBlock("down");
        }}
        title={routineEditorMessages.moveDownButton}
      />
      <Button
        disabled={isLastRoutineDraftBlock}
        onPress={handleJoinSupersetWithNextBlock}
        title={routineEditorMessages.joinSupersetButton}
      />
    </>
  );
}

function RoutineEditorExercise({
  dispatchRoutineDraftAction,
  exerciseNames,
  onAddWarmUpExercise,
  onLeaveSuperset,
  routineDraftExercise,
  shouldShowValidationErrors,
  warmUpForExerciseName,
}: RoutineEditorExerciseProperties) {
  const runtime = useRuntime();

  function handleAddSet() {
    dispatchRoutineDraftAction({
      routineExerciseId: routineDraftExercise.id,
      routineExerciseSetId: runtime.runSync(createIdentifier()),
      type: "addedSet",
    });
  }

  function handleChangeNote(note: string) {
    dispatchRoutineDraftAction({
      note,
      routineExerciseId: routineDraftExercise.id,
      type: "changedExerciseNote",
    });
  }

  function handleRemoveExercise() {
    dispatchRoutineDraftAction({
      routineExerciseId: routineDraftExercise.id,
      type: "removedExercise",
    });
  }

  return (
    <>
      <Text>{exerciseNames.get(routineDraftExercise.exerciseId)}</Text>
      {typeof warmUpForExerciseName === "string" ? (
        <Text>
          {routineEditorMessages.warmUpForExerciseLabel(warmUpForExerciseName)}
        </Text>
      ) : null}
      <TextField
        label={routineEditorMessages.exerciseNoteLabel}
        multiline
        onChangeText={handleChangeNote}
        value={routineDraftExercise.note}
      />
      {routineDraftExercise.sets.map((routineDraftExerciseSet, setIndex) => (
        <RoutineEditorSet
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          key={routineDraftExerciseSet.id}
          routineDraftExerciseSet={routineDraftExerciseSet}
          routineExerciseId={routineDraftExercise.id}
          setNumber={setIndex + 1}
          shouldShowValidationErrors={shouldShowValidationErrors}
        />
      ))}
      <Button
        onPress={handleAddSet}
        title={routineEditorMessages.addSetButton}
      />
      {onAddWarmUpExercise ? (
        <Button
          onPress={onAddWarmUpExercise}
          title={routineEditorMessages.addWarmUpExerciseButton}
        />
      ) : null}
      {onLeaveSuperset ? (
        <Button
          onPress={onLeaveSuperset}
          title={routineEditorMessages.leaveSupersetButton}
        />
      ) : null}
      <Button
        onPress={handleRemoveExercise}
        title={routineEditorMessages.removeExerciseButton}
      />
    </>
  );
}

function RoutineEditorSection({
  dispatchRoutineDraftAction,
  exerciseNames,
  onOpenExercisePicker,
  routineDraftBlocks,
  section,
  shouldShowValidationErrors,
}: RoutineEditorSectionProperties) {
  return (
    <>
      <Text>{SECTION_LABELS[section]}</Text>
      {routineDraftBlocks.map((routineDraftBlock, routineDraftBlockIndex) => (
        <RoutineEditorBlock
          dispatchRoutineDraftAction={dispatchRoutineDraftAction}
          exerciseNames={exerciseNames}
          isFirstRoutineDraftBlock={routineDraftBlockIndex === 0}
          isLastRoutineDraftBlock={
            routineDraftBlockIndex === routineDraftBlocks.length - 1
          }
          key={routineDraftBlock.id}
          onOpenExercisePicker={onOpenExercisePicker}
          routineDraftBlock={routineDraftBlock}
          section={section}
          shouldShowValidationErrors={shouldShowValidationErrors}
        />
      ))}
      <Button
        onPress={() => {
          onOpenExercisePicker({ section });
        }}
        title={routineEditorMessages.addExerciseButton}
      />
    </>
  );
}

function RoutineEditorSet({
  dispatchRoutineDraftAction,
  routineDraftExerciseSet,
  routineExerciseId,
  setNumber,
  shouldShowValidationErrors,
}: RoutineEditorSetProperties) {
  const validationErrors = shouldShowValidationErrors
    ? getRoutineDraftExerciseSetValidationErrors(routineDraftExerciseSet)
    : undefined;

  function handleChangeSet(
    routineDraftExerciseSetChanges: Partial<RoutineDraftExerciseSet>,
  ) {
    dispatchRoutineDraftAction({
      routineExerciseId,
      routineExerciseSet: {
        ...routineDraftExerciseSet,
        ...routineDraftExerciseSetChanges,
      },
      type: "changedSet",
    });
  }

  function handleChangeVariation(variationPickerOption: VariationPickerOption) {
    handleChangeSet({
      variation:
        variationPickerOption === NO_VARIATION_PICKER_OPTION
          ? undefined
          : variationPickerOption,
    });
  }

  function handleRemoveSet() {
    dispatchRoutineDraftAction({
      routineExerciseId,
      routineExerciseSetId: routineDraftExerciseSet.id,
      type: "removedSet",
    });
  }

  return (
    <>
      <Text>{routineEditorMessages.setLabel(setNumber)}</Text>
      <PickerField
        label={routineEditorMessages.setTypeLabel}
        onChangeSelectedOption={(setType) => {
          handleChangeSet({ setType });
        }}
        optionLabels={SET_TYPE_LABELS}
        options={SET_TYPES}
        selectedOption={routineDraftExerciseSet.setType}
      />
      <TextField
        errorMessage={validationErrors?.amount}
        inputMode="numeric"
        label={routineEditorMessages.amountLabel}
        onChangeText={(amount) => {
          handleChangeSet({ amount });
        }}
        value={routineDraftExerciseSet.amount}
      />
      <TextField
        errorMessage={validationErrors?.restSeconds}
        inputMode="numeric"
        label={routineEditorMessages.restSecondsLabel}
        onChangeText={(restSeconds) => {
          handleChangeSet({ restSeconds });
        }}
        value={routineDraftExerciseSet.restSeconds}
      />
      <PickerField
        label={routineEditorMessages.variationLabel}
        onChangeSelectedOption={handleChangeVariation}
        optionLabels={VARIATION_PICKER_LABELS}
        options={VARIATION_PICKER_OPTIONS}
        selectedOption={
          routineDraftExerciseSet.variation ?? NO_VARIATION_PICKER_OPTION
        }
      />
      {routineDraftExerciseSet.variation === "rest_pause" ? (
        <>
          <TextField
            errorMessage={validationErrors?.restPauseRestSeconds}
            inputMode="numeric"
            label={routineEditorMessages.restPauseRestSecondsLabel}
            onChangeText={(restPauseRestSeconds) => {
              handleChangeSet({ restPauseRestSeconds });
            }}
            value={routineDraftExerciseSet.restPauseRestSeconds}
          />
          <TextField
            errorMessage={validationErrors?.restPauseSegmentCount}
            inputMode="numeric"
            label={routineEditorMessages.restPauseSegmentCountLabel}
            onChangeText={(restPauseSegmentCount) => {
              handleChangeSet({ restPauseSegmentCount });
            }}
            value={routineDraftExerciseSet.restPauseSegmentCount}
          />
        </>
      ) : null}
      {routineDraftExerciseSet.variation === "drop_set" ? (
        <>
          <TextField
            errorMessage={validationErrors?.dropSetSegmentCount}
            inputMode="numeric"
            label={routineEditorMessages.dropSetSegmentCountLabel}
            onChangeText={(dropSetSegmentCount) => {
              handleChangeSet({ dropSetSegmentCount });
            }}
            value={routineDraftExerciseSet.dropSetSegmentCount}
          />
          <TextField
            errorMessage={validationErrors?.dropSetWeightPercentage}
            inputMode="numeric"
            label={routineEditorMessages.dropSetWeightPercentageLabel}
            onChangeText={(dropSetWeightPercentage) => {
              handleChangeSet({ dropSetWeightPercentage });
            }}
            value={routineDraftExerciseSet.dropSetWeightPercentage}
          />
        </>
      ) : null}
      <Host matchContents>
        <Switch
          label={routineEditorMessages.toFailureLabel}
          onValueChange={(isToFailure) => {
            handleChangeSet({ isToFailure });
          }}
          value={routineDraftExerciseSet.isToFailure}
        />
      </Host>
      <TextField
        autoCapitalize="characters"
        autoCorrect={false}
        errorMessage={validationErrors?.tempo}
        label={routineEditorMessages.tempoLabel}
        onChangeText={(tempo) => {
          handleChangeSet({ tempo });
        }}
        value={routineDraftExerciseSet.tempo}
      />
      <Button
        onPress={handleRemoveSet}
        title={routineEditorMessages.removeSetButton}
      />
    </>
  );
}
