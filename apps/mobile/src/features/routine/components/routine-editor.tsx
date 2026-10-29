import type { ReactElement, ReactNode } from "react";

import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/days-of-week";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useReducer, useState } from "react";
import { Modal } from "react-native";

import type { ExercisePickerTarget } from "#/features/routine/components/routine-editor-section.tsx";
import type { Exercise } from "#/shared/exercise-application-service.ts";
import type { Routine } from "#/shared/routine.ts";

import { RoutineEditorSection } from "#/features/routine/components/routine-editor-section.tsx";
import { createRoutineDraft } from "#/features/routine/core/create-routine-draft.ts";
import { getRoutineSaveErrorMessage } from "#/features/routine/core/get-routine-save-error-message.ts";
import { routineDraftReducer } from "#/features/routine/core/routine-draft-reducer.ts";
import { routineFormSchema } from "#/features/routine/core/routine-form-schema.ts";
import { ROUTINE_MESSAGES } from "#/features/routine/messages/routine-messages.ts";
import { routineSaveMutationOptions } from "#/features/routine/mutations/routine-save-mutation-options.ts";
import { routineListQueryOptions } from "#/features/routine/queries/routine-list-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { CheckboxGroup } from "#/shared/components/checkbox-group.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useCreateId } from "#/shared/hooks/use-create-id.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { exerciseListQueryOptions } from "#/shared/queries/exercise-list-query-options.ts";

/**
 * Edits the Draft of a Routine, a new one when `routine` is `null`, and
 * Saves it.
 */
export function RoutineEditor({
  children,
  renderExercisePicker,
  routine,
}: {
  children?: ReactNode;
  renderExercisePicker: (
    onSelectExercise: (exercise: Exercise) => void,
  ) => ReactElement;
  routine: null | Routine;
}) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const runtime = useRuntime();

  const createId = useCreateId();

  const [routineDraft, dispatch] = useReducer(
    routineDraftReducer,
    routine,
    createRoutineDraft,
  );
  const [exercisePickerTarget, setExercisePickerTarget] =
    useState<ExercisePickerTarget | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const exerciseLibrary = useQuery(exerciseListQueryOptions(runtime));

  const saveRoutine = useMutation({
    ...routineSaveMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routineListQueryOptions(runtime).queryKey,
      });

      router.dismissTo("/");
    },
  });

  const routineFormDecoding = decodeForm({
    schema: routineFormSchema,
    values: routineDraft,
  });
  const exerciseNames = new Map(
    exerciseLibrary.data?.map((exercise) => [exercise.id, exercise.name]),
  );
  const nameErrorMessage = hasSubmitted
    ? routineFormDecoding.errorMessages.name
    : null;
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (saveRoutine.error !== null) {
      return getRoutineSaveErrorMessage(saveRoutine.error);
    }

    if (!hasSubmitted || routineFormDecoding.isValid) {
      return null;
    }

    return (
      routineFormDecoding.errorMessage ??
      ROUTINE_MESSAGES.routineDraftInvalidError
    );
  }

  function handleDismissExercisePicker() {
    setExercisePickerTarget(null);
  }

  function handleSaveRoutine() {
    if (saveRoutine.isPending) {
      return;
    }

    setHasSubmitted(true);
    saveRoutine.reset();

    const id = routineDraft.id === "" ? createId() : routineDraft.id;

    dispatch({ id, type: "assignedId" });

    const savedRoutineFormDecoding = decodeForm({
      schema: routineFormSchema,
      values: { ...routineDraft, id },
    });

    if (savedRoutineFormDecoding.value !== null) {
      saveRoutine.mutate(savedRoutineFormDecoding.value);
    }
  }

  function handleSelectExercise(exercise: Exercise) {
    if (exercisePickerTarget === null) {
      return;
    }

    if ("section" in exercisePickerTarget) {
      const exerciseGroupId = createId();

      dispatch({
        exerciseGroupId,
        exerciseId: exercise.id,
        routineExerciseId: createId(),
        section: exercisePickerTarget.section,
        type: "addedExercise",
      });
    } else {
      dispatch({
        exerciseId: exercise.id,
        routineExerciseId: createId(),
        type: "addedWarmUpExercise",
        warmUpForRoutineExerciseId:
          exercisePickerTarget.warmUpForRoutineExerciseId,
      });
    }

    setExercisePickerTarget(null);
  }

  return (
    <>
      <ScrollView>
        <TextField
          errorMessage={nameErrorMessage}
          label={ROUTINE_MESSAGES.routineNameLabel}
          onChangeText={(name) => {
            dispatch({ name, type: "changedName" });
          }}
          value={routineDraft.name}
        />
        <CheckboxGroup
          label={ROUTINE_MESSAGES.daysLabel}
          onChangeSelectedOptions={(days) => {
            dispatch({ days, type: "changedDays" });
          }}
          optionLabels={ROUTINE_MESSAGES.dayOfWeekLabels}
          options={DAYS_OF_WEEK}
          selectedOptions={routineDraft.days}
        />
        <RoutineEditorSection
          dispatch={dispatch}
          exerciseGroups={routineDraft.sections.warmUp}
          exerciseNames={exerciseNames}
          hasSubmitted={hasSubmitted}
          onOpenExercisePicker={setExercisePickerTarget}
          section="warm_up"
        />
        <RoutineEditorSection
          dispatch={dispatch}
          exerciseGroups={routineDraft.sections.main}
          exerciseNames={exerciseNames}
          hasSubmitted={hasSubmitted}
          onOpenExercisePicker={setExercisePickerTarget}
          section="main"
        />
        <RoutineEditorSection
          dispatch={dispatch}
          exerciseGroups={routineDraft.sections.coolDown}
          exerciseNames={exerciseNames}
          hasSubmitted={hasSubmitted}
          onOpenExercisePicker={setExercisePickerTarget}
          section="cool_down"
        />
        <Button
          isBusy={saveRoutine.isPending}
          onPress={handleSaveRoutine}
          title={ROUTINE_MESSAGES.saveRoutineButton}
        />
        <StatusMessage message={statusMessage} />
        {children}
      </ScrollView>
      <Modal
        animationType="slide"
        onRequestClose={handleDismissExercisePicker}
        presentationStyle="pageSheet"
        visible={exercisePickerTarget !== null}
      >
        {renderExercisePicker(handleSelectExercise)}
      </Modal>
    </>
  );
}
