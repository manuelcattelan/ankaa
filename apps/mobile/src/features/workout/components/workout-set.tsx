import type { WeightUnit } from "@ankaa/core/features/workout/constants/weight";
import type { AmountUnit } from "@ankaa/core/shared/constants/amount";
import type { WeightType } from "@ankaa/core/shared/constants/weight-types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { RecordedSetDraftsAction } from "#/features/workout/core/recorded-set-drafts-reducer.ts";
import type { RecordedSetDraft } from "#/features/workout/core/recorded-set-form-schema.ts";
import type { Workout } from "#/features/workout/workout-application-service.ts";

import { WorkoutPlannedSet } from "#/features/workout/components/workout-planned-set.tsx";
import { WorkoutSegment } from "#/features/workout/components/workout-segment.tsx";
import { createRecordedSetDraft } from "#/features/workout/core/create-recorded-set-draft.ts";
import { getWorkoutRemoveSetErrorMessage } from "#/features/workout/core/get-workout-remove-set-error-message.ts";
import { getWorkoutSaveSetErrorMessage } from "#/features/workout/core/get-workout-save-set-error-message.ts";
import { isRecordedSetDraftSaved } from "#/features/workout/core/is-recorded-set-draft-saved.ts";
import { recordedSetFormSchema } from "#/features/workout/core/recorded-set-form-schema.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutRemoveSetMutationOptions } from "#/features/workout/mutations/workout-remove-set-mutation-options.ts";
import { workoutSaveSetMutationOptions } from "#/features/workout/mutations/workout-save-set-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { createId } from "#/shared/interactors/create-id.ts";

type WorkoutExercise =
  Workout["sections"]["coolDown"][number]["exercises"][number];

/**
 * Shows one Set of a Workout exercise with what the plan says about it, and
 * lets the User fill in its Segments and Save it when it's a recorded Set or
 * the next one to record. Only the last recorded Set can be removed.
 */
export function WorkoutSet({
  amountUnit,
  dispatch,
  draft,
  exerciseId,
  isRecordable,
  isRemovable,
  plannedSet,
  position,
  recordedSet,
  weightType,
  weightUnit,
  workoutExerciseId,
}: {
  amountUnit: AmountUnit;
  dispatch: (action: RecordedSetDraftsAction) => void;
  draft: null | RecordedSetDraft;
  exerciseId: string;
  isRecordable: boolean;
  isRemovable: boolean;
  plannedSet: Omit<WorkoutExercise["plannedSets"][number], "id">;
  position: number;
  recordedSet: null | WorkoutExercise["recordedSets"][number];
  weightType: WeightType;
  weightUnit: WeightUnit;
  workoutExerciseId: string;
}) {
  const queryClient = useQueryClient();

  const runtime = useRuntime();

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const saveSet = useMutation({
    ...workoutSaveSetMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      dispatch({
        position,
        type: "clearedRecordedSetDraft",
        workoutExerciseId,
      });
    },
  });
  const removeSet = useMutation({
    ...workoutRemoveSetMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      setHasSubmitted(false);
      dispatch({ position, type: "removedRecordedSet", workoutExerciseId });
    },
  });

  const recordedSetDraft = draft ?? createRecordedSetDraft(recordedSet);
  const recordedSetFormDecoding = decodeForm({
    schema: recordedSetFormSchema,
    values: recordedSetDraft,
  });
  const maximumSegmentCount = plannedSet.intensityTechnique?.segmentCount ?? 1;
  const statusMessage = getStatusMessage();

  function getStatusMessage() {
    if (saveSet.error !== null) {
      return getWorkoutSaveSetErrorMessage(saveSet.error);
    }

    if (removeSet.error !== null) {
      return getWorkoutRemoveSetErrorMessage(removeSet.error);
    }

    return hasSubmitted && !recordedSetFormDecoding.isValid
      ? WORKOUT_MESSAGES.recordedSetDraftInvalidError
      : null;
  }

  function handleChangeDraft(changedDraft: RecordedSetDraft) {
    dispatch(
      isRecordedSetDraftSaved({ draft: changedDraft, recordedSet })
        ? { position, type: "clearedRecordedSetDraft", workoutExerciseId }
        : {
            entry: {
              draft: changedDraft,
              exerciseId,
              position,
              workoutExerciseId,
            },
            type: "changedRecordedSetDraft",
          },
    );
  }

  function handleRemoveSet() {
    if (removeSet.isPending) {
      return;
    }

    removeSet.mutate({ workoutExerciseId });
  }

  function handleSaveSet() {
    if (saveSet.isPending) {
      return;
    }

    setHasSubmitted(true);
    saveSet.reset();

    const savedDraft = {
      ...recordedSetDraft,
      id:
        recordedSetDraft.id === ""
          ? runtime.runSync(createId())
          : recordedSetDraft.id,
    };

    handleChangeDraft(savedDraft);

    const savedDraftDecoding = decodeForm({
      schema: recordedSetFormSchema,
      values: savedDraft,
    });

    if (savedDraftDecoding.value !== null) {
      saveSet.mutate({
        ...savedDraftDecoding.value,
        weightUnit,
        workoutExerciseId,
      });
    }
  }

  return (
    <>
      <WorkoutPlannedSet
        amountUnit={amountUnit}
        plannedSet={plannedSet}
        setNumber={position + 1}
      />
      {isRecordable ? (
        <>
          {recordedSetDraft.segments.map((segment, segmentPosition) => (
            <WorkoutSegment
              amountUnit={amountUnit}
              hasSubmitted={hasSubmitted}
              key={segmentPosition}
              onChangeSegment={(changedSegment) => {
                handleChangeDraft({
                  ...recordedSetDraft,
                  segments: recordedSetDraft.segments.map(
                    (draftSegment, draftSegmentPosition) =>
                      draftSegmentPosition === segmentPosition
                        ? changedSegment
                        : draftSegment,
                  ),
                });
              }}
              segment={segment}
              segmentNumber={
                maximumSegmentCount === 1 ? null : segmentPosition + 1
              }
              weightType={weightType}
              weightUnit={weightUnit}
            />
          ))}
          {recordedSetDraft.segments.length < maximumSegmentCount ? (
            <Button
              onPress={() => {
                handleChangeDraft({
                  ...recordedSetDraft,
                  segments: [
                    ...recordedSetDraft.segments,
                    { amount: "", weight: "" },
                  ],
                });
              }}
              title={WORKOUT_MESSAGES.addSegmentButton}
            />
          ) : null}
          {recordedSetDraft.segments.length > 1 ? (
            <Button
              onPress={() => {
                handleChangeDraft({
                  ...recordedSetDraft,
                  segments: recordedSetDraft.segments.slice(
                    0,
                    recordedSetDraft.segments.length - 1,
                  ),
                });
              }}
              title={WORKOUT_MESSAGES.removeSegmentButton}
            />
          ) : null}
          <Button
            isBusy={saveSet.isPending}
            onPress={handleSaveSet}
            title={WORKOUT_MESSAGES.saveSetButton}
          />
          {isRemovable ? (
            <Button
              isBusy={removeSet.isPending}
              onPress={handleRemoveSet}
              title={WORKOUT_MESSAGES.removeSetButton}
            />
          ) : null}
          <StatusMessage message={statusMessage} />
        </>
      ) : null}
    </>
  );
}
