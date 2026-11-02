import type { SkipReason } from "@ankaa/core/shared/constants/skip-reasons";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { SkipDraft } from "#/features/workout/core/skip-form-schema.ts";

import { getWorkoutSaveSkipErrorMessage } from "#/features/workout/core/get-workout-save-skip-error-message.ts";
import { skipFormSchema } from "#/features/workout/core/skip-form-schema.ts";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutSaveSkipMutationOptions } from "#/features/workout/mutations/workout-save-skip-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { SkipReasonPicker } from "#/shared/components/skip-reason-picker.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

/**
 * Lets the User give a Workout exercise a Skip, with a reason and an optional
 * note, or clear it, and Save it through its own button, and refuses to while
 * a Set of the Workout exercise has a Draft left to Save, which the Skip would
 * keep from being Saved.
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

  const [hasRefusedSave, setHasRefusedSave] = useState(false);

  const saveSkip = useMutation({
    ...workoutSaveSkipMutationOptions(runtime),
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
  const hasRecordedSetDrafts = workoutContext.drafts.recordedSets.some(
    (entry) => entry.workoutExerciseId === workoutExerciseId,
  );
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (hasRefusedSave && hasRecordedSetDrafts) {
      return WORKOUT_MESSAGES.recordedSetDraftsUnsavedError;
    }

    if (saveSkip.error !== null) {
      return getWorkoutSaveSkipErrorMessage(saveSkip.error);
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
    if (saveSkip.isPending) {
      return;
    }

    setHasSubmitted(true);
    saveSkip.reset();

    if (hasRecordedSetDrafts) {
      setHasRefusedSave(true);

      return;
    }

    if (skipFormDecoding.value !== null) {
      saveSkip.mutate({ ...skipFormDecoding.value, workoutExerciseId });
    }
  }

  return (
    <>
      <SkipReasonPicker
        label={WORKOUT_MESSAGES.skipReasonLabel}
        noReasonLabel={WORKOUT_MESSAGES.notSkippedLabel}
        onChangeReason={(changedReason) => {
          handleChangeDraft({ ...skipDraft, reason: changedReason });
        }}
        reason={skipDraft.reason}
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
        isBusy={saveSkip.isPending}
        onPress={handleSaveSkip}
        title={WORKOUT_MESSAGES.saveSkipButton}
      />
      <StatusMessage message={statusMessage} />
    </>
  );
}
