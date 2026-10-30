import type { WeightUnit } from "@ankaa/core/features/workout/constants/weight";
import type { AmountUnit } from "@ankaa/core/shared/constants/amount";
import type { WeightType } from "@ankaa/core/shared/constants/weight-types";

import { getMaximumSegmentCount } from "@ankaa/core/features/workout/get-maximum-segment-count";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { Countdown } from "#/features/workout/core/get-countdown-remaining-seconds.ts";
import type { RecordedSetDraft } from "#/features/workout/core/recorded-set-form-schema.ts";
import type { PlannedSet, RecordedSet } from "#/shared/workout.ts";

import { WorkoutCountdown } from "#/features/workout/components/workout-countdown.tsx";
import { WorkoutPlannedSet } from "#/features/workout/components/workout-planned-set.tsx";
import { WorkoutSegment } from "#/features/workout/components/workout-segment.tsx";
import { createRecordedSetDraft } from "#/features/workout/core/create-recorded-set-draft.ts";
import { getWorkoutRemoveSetErrorMessage } from "#/features/workout/core/get-workout-remove-set-error-message.ts";
import { getWorkoutSaveSetErrorMessage } from "#/features/workout/core/get-workout-save-set-error-message.ts";
import { isRecordedSetDraftSaved } from "#/features/workout/core/is-recorded-set-draft-saved.ts";
import { recordedSetFormSchema } from "#/features/workout/core/recorded-set-form-schema.ts";
import { useWorkoutContext } from "#/features/workout/hooks/use-workout-context.ts";
import { WORKOUT_MESSAGES } from "#/features/workout/messages/workout-messages.ts";
import { workoutRemoveSetMutationOptions } from "#/features/workout/mutations/workout-remove-set-mutation-options.ts";
import { workoutSaveSetMutationOptions } from "#/features/workout/mutations/workout-save-set-mutation-options.ts";
import { workoutFindInProgressQueryOptions } from "#/features/workout/queries/workout-find-in-progress-query-options.ts";
import { Button } from "#/shared/components/button.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { decodeForm } from "#/shared/core/decode-form.ts";
import { useCreateId } from "#/shared/hooks/use-create-id.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

/**
 * Shows one Set of a Workout exercise with its matching planned Set, and
 * lets the User fill in its Segments and Save it when it's a recorded Set or
 * the next one to record, and remove it when it's a recorded Set. Under it,
 * the User starts the countdown of its planned Rest, whether or not it's
 * Saved yet, and of a Pause when it's a Rest-pause set.
 */
export function WorkoutSet({
  amountUnit,
  canStartRest,
  draft,
  exerciseId,
  isRecordable,
  plannedSet,
  position,
  recordedSet,
  weightType,
  weightUnit,
  workoutExerciseId,
}: {
  amountUnit: AmountUnit;
  canStartRest: boolean;
  draft: null | RecordedSetDraft;
  exerciseId: string;
  isRecordable: boolean;
  plannedSet: Omit<PlannedSet, "id">;
  position: number;
  recordedSet: null | RecordedSet;
  weightType: WeightType;
  weightUnit: WeightUnit;
  workoutExerciseId: string;
}) {
  const queryClient = useQueryClient();

  const workoutContext = useWorkoutContext();

  const runtime = useRuntime();

  const createId = useCreateId();

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const saveSet = useMutation({
    ...workoutSaveSetMutationOptions(runtime),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workoutFindInProgressQueryOptions(runtime).queryKey,
      });

      workoutContext.dispatch({
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
      workoutContext.dispatch({
        position,
        type: "removedRecordedSet",
        workoutExerciseId,
      });
    },
  });

  const recordedSetDraft = draft ?? createRecordedSetDraft(recordedSet);
  const recordedSetFormDecoding = decodeForm({
    hasSubmitted,
    schema: recordedSetFormSchema,
    values: recordedSetDraft,
  });
  const maximumSegmentCount = getMaximumSegmentCount(plannedSet);
  const restSeconds = canStartRest ? plannedSet.restSeconds : null;
  const pauseSeconds =
    plannedSet.intensityTechnique?._tag === "RestPauseSet"
      ? plannedSet.intensityTechnique.pauseSeconds
      : null;
  const shownCountdown =
    workoutContext.countdown?.workoutExerciseId === workoutExerciseId &&
    workoutContext.countdown.position === position
      ? workoutContext.countdown
      : null;
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
    workoutContext.dispatch(
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

  function handleStartCountdown({
    kind,
    seconds,
  }: {
    kind: Countdown["kind"];
    seconds: number;
  }) {
    workoutContext.onStartCountdown({
      kind,
      position,
      seconds,
      workoutExerciseId,
    });
  }

  function handleRemoveSet(removedRecordedSet: { id: string }) {
    if (removeSet.isPending) {
      return;
    }

    removeSet.mutate({ id: removedRecordedSet.id, workoutExerciseId });
  }

  function handleSaveSet() {
    if (saveSet.isPending) {
      return;
    }

    setHasSubmitted(true);
    saveSet.reset();

    const savedDraft = {
      ...recordedSetDraft,
      id: recordedSetDraft.id === "" ? createId() : recordedSetDraft.id,
    };

    handleChangeDraft(savedDraft);

    const savedDraftDecoding = decodeForm({
      hasSubmitted: true,
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
              number={maximumSegmentCount === 1 ? null : segmentPosition + 1}
              onChange={(changedSegment) => {
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
          {recordedSet === null ? null : (
            <Button
              isBusy={removeSet.isPending}
              onPress={() => {
                handleRemoveSet(recordedSet);
              }}
              title={WORKOUT_MESSAGES.removeSetButton}
            />
          )}
          <StatusMessage message={statusMessage} />
        </>
      ) : null}
      {pauseSeconds === null ? null : (
        <Button
          onPress={() => {
            handleStartCountdown({ kind: "pause", seconds: pauseSeconds });
          }}
          title={WORKOUT_MESSAGES.startPauseButton}
        />
      )}
      {restSeconds === null ? null : (
        <Button
          onPress={() => {
            handleStartCountdown({
              kind: "rest",
              seconds: restSeconds,
            });
          }}
          title={WORKOUT_MESSAGES.startRestButton}
        />
      )}
      {shownCountdown === null ? null : (
        <>
          <WorkoutCountdown
            countdown={shownCountdown}
            key={shownCountdown.startTime}
            onEnd={workoutContext.onEndCountdown}
          />
          {shownCountdown.kind === "rest" ? (
            <Button
              onPress={workoutContext.onSkipCountdown}
              title={WORKOUT_MESSAGES.skipRestButton}
            />
          ) : null}
        </>
      )}
    </>
  );
}
