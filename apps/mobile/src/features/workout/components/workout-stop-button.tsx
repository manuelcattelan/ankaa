import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

import type { SkipDraft } from "#/features/workout/core/skip-form-schema.ts";
import type { Workout } from "#/shared/workout.ts";

import { getWorkoutStopErrorMessage } from "#/features/workout/core/get-workout-stop-error-message.ts";
import { isEveryWorkoutExerciseDone } from "#/features/workout/core/is-every-workout-exercise-done.ts";
import { skipFormSchema } from "#/features/workout/core/skip-form-schema.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutStopMutationOptions } from "#/features/workout/mutations/workout-stop-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { SkipReasonPicker } from "#/shared/components/skip-reason-picker.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

const NO_SKIP_DRAFT: SkipDraft = { note: "", reason: null };

/**
 * Stops the Workout in progress, and refuses to while any Set, note or Skip
 * has a Draft left to Save, naming those rows in `unsavedDraftLabels`. When
 * some Workout exercise isn't done, the first press asks for the reason and
 * the note of the Skip that the stop gives every such Workout exercise, and
 * the next one stops with them. When the server finds a Workout exercise not
 * done that the screen showed as done, it reads the Workout again and asks.
 */
export function WorkoutStopButton({
  unsavedDraftLabels,
  workout,
}: {
  unsavedDraftLabels: readonly string[];
  workout: Workout;
}) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const runtime = useRuntime();

  const [hasRefusedStop, setHasRefusedStop] = useState(false);
  const [hasAskedForSkip, setHasAskedForSkip] = useState(false);
  const [hasSubmittedSkip, setHasSubmittedSkip] = useState(false);
  const [skipDraft, setSkipDraft] = useState(NO_SKIP_DRAFT);

  const stopWorkout = useMutation({
    ...workoutStopMutationOptions(runtime),
    onError: async (error) => {
      if (error._tag !== "SkipReasonMissingError") {
        return;
      }

      setHasAskedForSkip(true);

      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      router.dismissTo("/");
    },
  });

  const isWorkoutDone = isEveryWorkoutExerciseDone(workout);
  const isAskingForSkip = hasAskedForSkip && !isWorkoutDone;
  const skipFormDecoding = decodeForm({
    hasSubmitted: hasSubmittedSkip,
    schema: skipFormSchema,
    values: skipDraft,
  });
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (hasRefusedStop && unsavedDraftLabels.length > 0) {
      return WORKOUT_MESSAGES.draftsUnsavedError(unsavedDraftLabels);
    }

    if (stopWorkout.error !== null) {
      return getWorkoutStopErrorMessage(stopWorkout.error);
    }

    if (!isAskingForSkip) {
      return null;
    }

    return skipFormDecoding.errorMessage ?? WORKOUT_MESSAGES.stopSkipStatus;
  }

  function handleStopWorkout() {
    if (stopWorkout.isPending) {
      return;
    }

    stopWorkout.reset();

    if (unsavedDraftLabels.length > 0) {
      setHasRefusedStop(true);

      return;
    }

    if (isWorkoutDone) {
      stopWorkout.mutate({ id: workout.id, note: null, reason: null });

      return;
    }

    if (!hasAskedForSkip) {
      setHasAskedForSkip(true);

      return;
    }

    setHasSubmittedSkip(true);

    if (skipFormDecoding.value !== null) {
      stopWorkout.mutate({ id: workout.id, ...skipFormDecoding.value });
    }
  }

  return (
    <>
      {isAskingForSkip ? (
        <>
          <SkipReasonPicker
            label={WORKOUT_MESSAGES.stopSkipReasonLabel}
            noReasonLabel={WORKOUT_MESSAGES.noStopSkipReasonLabel}
            onChangeReason={(changedReason) => {
              setSkipDraft({ ...skipDraft, reason: changedReason });
            }}
            reason={skipDraft.reason}
          />
          <TextField
            errorMessage={null}
            label={WORKOUT_MESSAGES.stopSkipNoteLabel}
            onChangeText={(changedNote) => {
              setSkipDraft({ ...skipDraft, note: changedNote });
            }}
            value={skipDraft.note}
          />
        </>
      ) : null}
      <Button
        isBusy={stopWorkout.isPending}
        onPress={handleStopWorkout}
        title={WORKOUT_MESSAGES.stopWorkoutButton}
      />
      <StatusMessage message={statusMessage} />
    </>
  );
}
