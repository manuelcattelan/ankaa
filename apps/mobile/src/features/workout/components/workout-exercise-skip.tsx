import type { SkipReason } from "@ankaa/core/features/workout/constants/skip-reasons";

import { SKIP_REASONS } from "@ankaa/core/features/workout/constants/skip-reasons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { SkipDraft } from "#/features/workout/core/skip-form-schema.ts";

import { getWorkoutSkipExerciseErrorMessage } from "#/features/workout/core/get-workout-skip-exercise-error-message.ts";
import { skipFormSchema } from "#/features/workout/core/skip-form-schema.ts";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutSkipExerciseMutationOptions } from "#/features/workout/mutations/workout-skip-exercise-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { PickerField } from "#/shared/components/picker-field.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

const NOT_SKIPPED = "not_skipped";

const SKIP_REASON_OPTIONS = [NOT_SKIPPED, ...SKIP_REASONS] as const;

const SKIP_REASON_OPTION_LABELS = {
  ...WORKOUT_MESSAGES.skipReasonLabels,
  [NOT_SKIPPED]: WORKOUT_MESSAGES.notSkippedLabel,
};

/**
 * Lets the User mark a Workout exercise as skipped, with a reason and an
 * optional note, or as not skipped, and Save it through its own button.
 */
export function WorkoutExerciseSkip({
  draft,
  exerciseId,
  note,
  reason,
  workoutExerciseId,
}: {
  draft: null | SkipDraft;
  exerciseId: string;
  note: null | string;
  reason: null | SkipReason;
  workoutExerciseId: string;
}) {
  const queryClient = useQueryClient();

  const workoutContext = useWorkoutContext();

  const runtime = useRuntime();

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const skipExercise = useMutation({
    ...workoutSkipExerciseMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      workoutContext.dispatch({ type: "clearedSkipDraft", workoutExerciseId });
    },
  });

  const savedSkipDraft = { note: note ?? "", reason };
  const skipDraft = draft ?? savedSkipDraft;
  const skipFormDecoding = decodeForm({
    hasSubmitted,
    schema: skipFormSchema,
    values: skipDraft,
  });
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (skipExercise.error !== null) {
      return getWorkoutSkipExerciseErrorMessage(skipExercise.error);
    }

    return skipFormDecoding.errorMessage;
  }

  function handleChangeDraft(changedDraft: SkipDraft) {
    workoutContext.dispatch(
      changedDraft.note === savedSkipDraft.note &&
        changedDraft.reason === savedSkipDraft.reason
        ? { type: "clearedSkipDraft", workoutExerciseId }
        : {
            entry: { draft: changedDraft, exerciseId, workoutExerciseId },
            type: "changedSkipDraft",
          },
    );
  }

  function handleSaveSkip() {
    if (skipExercise.isPending) {
      return;
    }

    setHasSubmitted(true);
    skipExercise.reset();

    if (skipFormDecoding.value !== null) {
      skipExercise.mutate({ ...skipFormDecoding.value, workoutExerciseId });
    }
  }

  return (
    <>
      <PickerField
        label={WORKOUT_MESSAGES.skipReasonLabel}
        onChangeSelectedOption={(selectedOption) => {
          handleChangeDraft({
            ...skipDraft,
            reason: selectedOption === NOT_SKIPPED ? null : selectedOption,
          });
        }}
        optionLabels={SKIP_REASON_OPTION_LABELS}
        options={SKIP_REASON_OPTIONS}
        selectedOption={skipDraft.reason ?? NOT_SKIPPED}
      />
      <TextField
        errorMessage={null}
        label={WORKOUT_MESSAGES.skipNoteLabel}
        onChangeText={(changedNote) => {
          handleChangeDraft({ ...skipDraft, note: changedNote });
        }}
        value={skipDraft.note}
      />
      <Button
        isBusy={skipExercise.isPending}
        onPress={handleSaveSkip}
        title={WORKOUT_MESSAGES.saveSkipButton}
      />
      <StatusMessage message={statusMessage} />
    </>
  );
}
