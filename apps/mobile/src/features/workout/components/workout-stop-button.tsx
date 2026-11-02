import { SKIP_REASONS } from "@ankaa/core/shared/constants/skip-reasons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";

import type { SkipDraft } from "#/features/workout/core/skip-form-schema.ts";
import type { Workout, WorkoutExercise } from "#/shared/workout.ts";

import { getWorkingSetCounts } from "#/features/workout/core/get-working-set-counts.ts";
import { getWorkoutStopErrorMessage } from "#/features/workout/core/get-workout-stop-error-message.ts";
import { skipFormSchema } from "#/features/workout/core/skip-form-schema.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutStopMutationOptions } from "#/features/workout/mutations/workout-stop-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { PickerField } from "#/shared/components/picker-field.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TextField } from "#/shared/components/text-field.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const NO_REASON = "no_reason";

const SKIP_REASON_OPTIONS = [NO_REASON, ...SKIP_REASONS] as const;

const SKIP_REASON_OPTION_LABELS = {
  ...SHARED_MESSAGES.skipReasonLabels,
  [NO_REASON]: WORKOUT_MESSAGES.noStopSkipReasonLabel,
};

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

  const isEveryWorkoutExerciseDone = getWorkoutExercises(workout).every(
    isWorkoutExerciseDone,
  );
  const isAskingForSkip = hasAskedForSkip && !isEveryWorkoutExerciseDone;
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

    if (isEveryWorkoutExerciseDone) {
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
          <PickerField
            label={WORKOUT_MESSAGES.stopSkipReasonLabel}
            onChangeSelectedOption={(selectedOption) => {
              setSkipDraft({
                ...skipDraft,
                reason: selectedOption === NO_REASON ? null : selectedOption,
              });
            }}
            optionLabels={SKIP_REASON_OPTION_LABELS}
            options={SKIP_REASON_OPTIONS}
            selectedOption={skipDraft.reason ?? NO_REASON}
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

/**
 * Gives every Workout exercise of a Workout, Warm-up exercises included.
 */
function getWorkoutExercises(workout: Workout) {
  return [
    ...workout.sections.warmUp.flatMap(
      (exerciseGroup) => exerciseGroup.exercises,
    ),
    ...workout.sections.main.flatMap((exerciseGroup) =>
      exerciseGroup.exercises.flatMap((workoutExercise) => [
        workoutExercise,
        ...workoutExercise.warmUpExercises,
      ]),
    ),
    ...workout.sections.coolDown.flatMap(
      (exerciseGroup) => exerciseGroup.exercises,
    ),
  ];
}

/**
 * Tells whether a stop leaves a Workout exercise as it is: it has a Skip, or
 * no planned Working set is left to record.
 */
function isWorkoutExerciseDone(workoutExercise: WorkoutExercise) {
  return (
    workoutExercise.skipReason !== null ||
    getWorkingSetCounts({
      plannedSets: workoutExercise.plannedSets,
      recordedSetCount: workoutExercise.recordedSets.length,
    }).leftCount === 0
  );
}
