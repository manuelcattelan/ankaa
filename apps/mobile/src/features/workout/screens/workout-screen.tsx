import type { SkipReason } from "@ankaa/core/features/workout/constants/skip-reason";
import type { WeightUnit } from "@ankaa/core/features/workout/constants/weight";
import type { AmountUnit } from "@ankaa/core/shared/constants/amount";
import type { Variation } from "@ankaa/core/shared/constants/intensity-technique";
import type { Section } from "@ankaa/core/shared/constants/section";
import type { WeightType } from "@ankaa/core/shared/constants/weight-type";

import { SKIP_REASONS } from "@ankaa/core/features/workout/constants/skip-reason";
import { WEIGHT_UNITS } from "@ankaa/core/features/workout/constants/weight";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
  WorkoutDocumentExerciseSetSegment,
  WorkoutDocumentRestTimer,
} from "@/features/workout/core/workout-document-schema";
import type { WorkoutDocumentsAction } from "@/features/workout/core/workout-documents-reducer";

import { formatElapsedTime } from "@/features/workout/core/format-elapsed-time";
import { getDropSetWeightValueSuggestion } from "@/features/workout/core/get-drop-set-weight-value-suggestion";
import { getElapsedSeconds } from "@/features/workout/core/get-elapsed-seconds";
import { getRestRemainingSeconds } from "@/features/workout/core/get-rest-remaining-seconds";
import { getVariationSegmentCount } from "@/features/workout/core/get-variation-segment-count";
import { getWorkoutDocumentExerciseBlockSection } from "@/features/workout/core/get-workout-document-exercise-block-section";
import { getWorkoutDocumentExerciseRestSeconds } from "@/features/workout/core/get-workout-document-exercise-rest-seconds";
import { getWorkoutDocumentExerciseSetSegmentValidationErrorMessages } from "@/features/workout/core/get-workout-document-exercise-set-segment-validation-error-messages";
import { getWorkoutDocumentExerciseWorkingSetCounts } from "@/features/workout/core/get-workout-document-exercise-working-set-counts";
import { getWorkoutDocumentRoutineExerciseSet } from "@/features/workout/core/get-workout-document-routine-exercise-set";
import { getWorkoutDocumentWarmUpForExerciseName } from "@/features/workout/core/get-workout-document-warm-up-for-exercise-name";
import { getWorkoutExercisePlacement } from "@/features/workout/core/get-workout-exercise-placement";
import { hasWorkoutDocumentValidationErrors } from "@/features/workout/core/has-workout-document-validation-errors";
import { validateWorkoutDocumentExerciseSetSegment } from "@/features/workout/core/validate-workout-document-exercise-set-segment";
import { useWorkoutDocuments } from "@/features/workout/hooks/use-workout-documents";
import { cancelRestNotification } from "@/features/workout/interactors/cancel-rest-notification";
import { scheduleRestNotification } from "@/features/workout/interactors/schedule-rest-notification";
import { workoutScreenMessages } from "@/features/workout/messages/workout-screen-messages";
import { Button } from "@/shared/components/button";
import { PickerField } from "@/shared/components/picker-field";
import { ScrollView } from "@/shared/components/scroll-view";
import { StatusMessage } from "@/shared/components/status-message";
import { Text } from "@/shared/components/text";
import { TextField } from "@/shared/components/text-field";
import { getExerciseNames } from "@/shared/core/get-exercise-names";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";
import { createIdentifier } from "@/shared/interactors/create-identifier";
import { createExerciseListQueryOptions } from "@/shared/queries/create-exercise-list-query-options";

type SkipReasonPickerOption = SkipReason | typeof NO_SKIP_REASON_PICKER_OPTION;

type WorkoutContentProperties = {
  workoutDocument: WorkoutDocument;
};

type WorkoutExerciseProperties = WorkoutSharedProperties & {
  exerciseName?: string;
  isLastExerciseOfRound: boolean;
  isSectionStart: boolean;
  isSupersetStart: boolean;
  warmUpForExerciseName?: string;
  workoutDocumentExercise: WorkoutDocumentExercise;
};

type WorkoutSegmentProperties = {
  amountPlaceholder?: string;
  amountUnit: AmountUnit;
  dispatchWorkoutDocumentsAction: (
    workoutDocumentsAction: WorkoutDocumentsAction,
  ) => void;
  segmentLabel?: string;
  shouldShowValidationErrors: boolean;
  weightType: WeightType;
  weightValuePlaceholder?: string;
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment;
  workoutExerciseId: string;
  workoutExerciseSetId: string;
  workoutId: string;
};

type WorkoutSetProperties = WorkoutSharedProperties & {
  setNumber: number;
  workoutDocumentExercise: WorkoutDocumentExercise;
  workoutDocumentExerciseSet: WorkoutDocumentExerciseSet;
};

type WorkoutSharedProperties = {
  dispatchWorkoutDocumentsAction: (
    workoutDocumentsAction: WorkoutDocumentsAction,
  ) => void;
  onStartRestTimer: (restSeconds: number) => void;
  shouldShowValidationErrors: boolean;
  workoutId: string;
};

type WorkoutTimersProperties = {
  onSkipRest: () => void;
  restTimer?: WorkoutDocumentRestTimer;
  startedAt: string;
};

const NO_SKIP_REASON_PICKER_OPTION = "none";

const CURRENT_TIME_INTERVAL_MILLISECONDS = 1_000;

const ADD_SEGMENT_BUTTON_TITLES = {
  drop_set: workoutScreenMessages.addDropSetSegmentButton,
  rest_pause: workoutScreenMessages.addRestPauseSegmentButton,
} satisfies Record<Variation, string>;

const AMOUNT_UNIT_LABELS = {
  repetition: workoutScreenMessages.repetitionAmountLabel,
  second: workoutScreenMessages.secondAmountLabel,
} satisfies Record<AmountUnit, string>;

const SECTION_LABELS = {
  cool_down: workoutScreenMessages.coolDownSectionLabel,
  main: workoutScreenMessages.mainSectionLabel,
  warm_up: workoutScreenMessages.warmUpSectionLabel,
} satisfies Record<Section, string>;

const SKIP_REASON_PICKER_LABELS = {
  low_energy: workoutScreenMessages.lowEnergySkipReasonLabel,
  low_on_time: workoutScreenMessages.lowOnTimeSkipReasonLabel,
  none: workoutScreenMessages.noSkipReasonLabel,
  ["other"]: workoutScreenMessages.otherSkipReasonLabel,
  pain: workoutScreenMessages.painSkipReasonLabel,
} satisfies Record<SkipReasonPickerOption, string>;

const SKIP_REASON_PICKER_OPTIONS: SkipReasonPickerOption[] = [
  NO_SKIP_REASON_PICKER_OPTION,
  ...SKIP_REASONS,
];

const VARIATION_LABELS = {
  drop_set: workoutScreenMessages.dropSetVariationLabel,
  rest_pause: workoutScreenMessages.restPauseVariationLabel,
} satisfies Record<Variation, string>;

const WEIGHT_TYPE_DESCRIPTIONS = {
  assisted: workoutScreenMessages.assistedWeightTypeDescription,
  bodyweight: workoutScreenMessages.bodyweightWeightTypeDescription,
  single: workoutScreenMessages.singleWeightTypeDescription,
  total: workoutScreenMessages.totalWeightTypeDescription,
} satisfies Record<Exclude<WeightType, "none">, string>;

const WEIGHT_UNIT_LABELS = {
  kilogram: workoutScreenMessages.kilogramWeightUnitLabel,
  pound: workoutScreenMessages.poundWeightUnitLabel,
} satisfies Record<WeightUnit, string>;

export function WorkoutScreen() {
  const workoutDocuments = useWorkoutDocuments();

  return (
    <>
      <Stack.Screen options={{ title: workoutScreenMessages.title }} />
      {workoutDocuments.workoutDocumentInProgress ? (
        <WorkoutContent
          workoutDocument={workoutDocuments.workoutDocumentInProgress}
        />
      ) : (
        <Redirect href="/" />
      )}
    </>
  );
}

function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(Date.now);

  useEffect(() => {
    const currentTimeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, CURRENT_TIME_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(currentTimeInterval);
    };
  }, []);

  return currentTime;
}

function WorkoutContent({ workoutDocument }: WorkoutContentProperties) {
  const router = useRouter();

  const runtime = useRuntime();

  const workoutDocuments = useWorkoutDocuments();

  const [shouldShowValidationErrors, setShouldShowValidationErrors] =
    useState(false);

  const exerciseLibrary = useQuery(createExerciseListQueryOptions(runtime));

  const exerciseNames = getExerciseNames(exerciseLibrary.data);
  const isWorkoutDocumentInvalid =
    shouldShowValidationErrors &&
    hasWorkoutDocumentValidationErrors(workoutDocument);

  function handleSkipRest() {
    void runtime.runPromise(cancelRestNotification(workoutDocument.restTimer));

    workoutDocuments.dispatchWorkoutDocumentsAction({
      type: "skippedRest",
      workoutId: workoutDocument.id,
    });
  }

  async function handleStartRestTimer(restSeconds: number) {
    const restTimerStartedAt = new Date().toISOString();

    await runtime.runPromise(cancelRestNotification(workoutDocument.restTimer));

    const restNotificationId = await runtime.runPromise(
      scheduleRestNotification(restSeconds),
    );

    workoutDocuments.dispatchWorkoutDocumentsAction({
      restTimer: {
        restNotificationId,
        restSeconds,
        startedAt: restTimerStartedAt,
      },
      type: "startedRestTimer",
      workoutId: workoutDocument.id,
    });
  }

  function handleStopWorkout() {
    setShouldShowValidationErrors(true);

    if (hasWorkoutDocumentValidationErrors(workoutDocument)) {
      runtime.runSync(
        announceMessage(workoutScreenMessages.workoutInvalidError),
      );

      return;
    }

    void runtime.runPromise(cancelRestNotification(workoutDocument.restTimer));

    workoutDocuments.dispatchWorkoutDocumentsAction({
      endedAt: new Date().toISOString(),
      type: "stoppedWorkout",
      workoutId: workoutDocument.id,
    });

    router.dismissTo("/");
  }

  return (
    <ScrollView>
      <WorkoutTimers
        onSkipRest={handleSkipRest}
        restTimer={workoutDocument.restTimer}
        startedAt={workoutDocument.startedAt}
      />
      {workoutDocument.exercises.map(
        (workoutDocumentExercise, exerciseIndex) => {
          const workoutExercisePlacement = getWorkoutExercisePlacement({
            exerciseIndex,
            workoutDocumentExercises: workoutDocument.exercises,
          });

          return (
            <WorkoutExercise
              dispatchWorkoutDocumentsAction={
                workoutDocuments.dispatchWorkoutDocumentsAction
              }
              exerciseName={exerciseNames.get(
                workoutDocumentExercise.exerciseId,
              )}
              isLastExerciseOfRound={
                workoutExercisePlacement.isLastExerciseOfRound
              }
              isSectionStart={workoutExercisePlacement.isSectionStart}
              isSupersetStart={workoutExercisePlacement.isSupersetStart}
              key={workoutDocumentExercise.id}
              onStartRestTimer={(restSeconds) => {
                void handleStartRestTimer(restSeconds);
              }}
              shouldShowValidationErrors={shouldShowValidationErrors}
              warmUpForExerciseName={getWorkoutDocumentWarmUpForExerciseName({
                exerciseNames,
                warmUpWorkoutDocumentExercise: workoutDocumentExercise,
                workoutDocument,
              })}
              workoutDocumentExercise={workoutDocumentExercise}
              workoutId={workoutDocument.id}
            />
          );
        },
      )}
      <Button
        onPress={handleStopWorkout}
        title={workoutScreenMessages.stopWorkoutButton}
      />
      <StatusMessage
        message={
          isWorkoutDocumentInvalid
            ? workoutScreenMessages.workoutInvalidError
            : undefined
        }
      />
    </ScrollView>
  );
}

function WorkoutExercise({
  dispatchWorkoutDocumentsAction,
  exerciseName,
  isLastExerciseOfRound,
  isSectionStart,
  isSupersetStart,
  onStartRestTimer,
  shouldShowValidationErrors,
  warmUpForExerciseName,
  workoutDocumentExercise,
  workoutId,
}: WorkoutExerciseProperties) {
  const runtime = useRuntime();

  const restSeconds = getWorkoutDocumentExerciseRestSeconds({
    isLastExerciseOfRound,
    workoutDocumentExercise,
  });
  const workingSetCounts = getWorkoutDocumentExerciseWorkingSetCounts(
    workoutDocumentExercise,
  );

  function handleAddSet() {
    dispatchWorkoutDocumentsAction({
      type: "addedSet",
      workoutExerciseId: workoutDocumentExercise.id,
      workoutExerciseSetId: runtime.runSync(createIdentifier()),
      workoutExerciseSetSegmentId: runtime.runSync(createIdentifier()),
      workoutId,
    });
  }

  function handleChangeNote(note: string) {
    dispatchWorkoutDocumentsAction({
      note,
      type: "changedExerciseNote",
      workoutExerciseId: workoutDocumentExercise.id,
      workoutId,
    });
  }

  function handleChangeSkipReason(
    skipReasonPickerOption: SkipReasonPickerOption,
  ) {
    dispatchWorkoutDocumentsAction({
      skipReason:
        skipReasonPickerOption === NO_SKIP_REASON_PICKER_OPTION
          ? undefined
          : skipReasonPickerOption,
      type: "changedSkipReason",
      workoutExerciseId: workoutDocumentExercise.id,
      workoutId,
    });
  }

  function handleChangeSkipReasonNote(skipReasonNote: string) {
    dispatchWorkoutDocumentsAction({
      skipReasonNote,
      type: "changedSkipReasonNote",
      workoutExerciseId: workoutDocumentExercise.id,
      workoutId,
    });
  }

  function handleRemoveSet() {
    dispatchWorkoutDocumentsAction({
      type: "removedSet",
      workoutExerciseId: workoutDocumentExercise.id,
      workoutId,
    });
  }

  function handleStartRest() {
    if (restSeconds === undefined) {
      return;
    }

    handleAddSet();
    onStartRestTimer(restSeconds);
  }

  return (
    <>
      {isSectionStart ? (
        <Text>
          {
            SECTION_LABELS[
              getWorkoutDocumentExerciseBlockSection(workoutDocumentExercise)
            ]
          }
        </Text>
      ) : null}
      {isSupersetStart ? (
        <Text>{workoutScreenMessages.supersetLabel}</Text>
      ) : null}
      <Text>{exerciseName}</Text>
      {typeof warmUpForExerciseName === "string" ? (
        <Text>
          {workoutScreenMessages.warmUpForExerciseLabel(warmUpForExerciseName)}
        </Text>
      ) : null}
      {workoutDocumentExercise.routineExerciseNote ? (
        <Text>
          {workoutScreenMessages.routineExerciseNoteLabel(
            workoutDocumentExercise.routineExerciseNote,
          )}
        </Text>
      ) : null}
      {workoutDocumentExercise.weightType !== "none" ? (
        <Text>
          {WEIGHT_TYPE_DESCRIPTIONS[workoutDocumentExercise.weightType]}
        </Text>
      ) : null}
      <Text>{workoutScreenMessages.setCounterStatus(workingSetCounts)}</Text>
      {workoutDocumentExercise.sets.map(
        (workoutDocumentExerciseSet, setIndex) => (
          <WorkoutSet
            dispatchWorkoutDocumentsAction={dispatchWorkoutDocumentsAction}
            key={workoutDocumentExerciseSet.id}
            onStartRestTimer={onStartRestTimer}
            setNumber={setIndex + 1}
            shouldShowValidationErrors={shouldShowValidationErrors}
            workoutDocumentExercise={workoutDocumentExercise}
            workoutDocumentExerciseSet={workoutDocumentExerciseSet}
            workoutId={workoutId}
          />
        ),
      )}
      {restSeconds !== undefined ? (
        <Button
          onPress={handleStartRest}
          title={workoutScreenMessages.startRestButton}
        />
      ) : null}
      <Button
        onPress={handleAddSet}
        title={workoutScreenMessages.addSetButton}
      />
      <Button
        disabled={workoutDocumentExercise.sets.length === 0}
        onPress={handleRemoveSet}
        title={workoutScreenMessages.removeSetButton}
      />
      <TextField
        label={workoutScreenMessages.exerciseNoteLabel}
        multiline
        onChangeText={handleChangeNote}
        value={workoutDocumentExercise.note}
      />
      <PickerField
        label={workoutScreenMessages.skipReasonLabel}
        onChangeSelectedOption={handleChangeSkipReason}
        optionLabels={SKIP_REASON_PICKER_LABELS}
        options={SKIP_REASON_PICKER_OPTIONS}
        selectedOption={
          workoutDocumentExercise.skipReason ?? NO_SKIP_REASON_PICKER_OPTION
        }
      />
      {workoutDocumentExercise.skipReason ? (
        <TextField
          label={workoutScreenMessages.skipReasonNoteLabel}
          multiline
          onChangeText={handleChangeSkipReasonNote}
          value={workoutDocumentExercise.skipReasonNote}
        />
      ) : null}
    </>
  );
}

function WorkoutSegment({
  amountPlaceholder,
  amountUnit,
  dispatchWorkoutDocumentsAction,
  segmentLabel,
  shouldShowValidationErrors,
  weightType,
  weightValuePlaceholder,
  workoutDocumentExerciseSetSegment,
  workoutExerciseId,
  workoutExerciseSetId,
  workoutId,
}: WorkoutSegmentProperties) {
  const workoutDocumentExerciseSetSegmentValidationErrorMessages =
    shouldShowValidationErrors
      ? getWorkoutDocumentExerciseSetSegmentValidationErrorMessages(
          validateWorkoutDocumentExerciseSetSegment(
            workoutDocumentExerciseSetSegment,
          ),
        )
      : undefined;

  function handleChangeSegment(
    workoutDocumentExerciseSetSegmentChanges: Partial<WorkoutDocumentExerciseSetSegment>,
  ) {
    dispatchWorkoutDocumentsAction({
      type: "changedSegment",
      workoutExerciseId,
      workoutExerciseSetId,
      workoutExerciseSetSegment: {
        ...workoutDocumentExerciseSetSegment,
        ...workoutDocumentExerciseSetSegmentChanges,
      },
      workoutId,
    });
  }

  return (
    <>
      {segmentLabel ? <Text>{segmentLabel}</Text> : null}
      <TextField
        errorMessage={
          workoutDocumentExerciseSetSegmentValidationErrorMessages?.amount
        }
        inputMode="numeric"
        label={AMOUNT_UNIT_LABELS[amountUnit]}
        onChangeText={(amount) => {
          handleChangeSegment({ amount });
        }}
        placeholder={amountPlaceholder}
        value={workoutDocumentExerciseSetSegment.amount}
      />
      {weightType !== "none" ? (
        <TextField
          errorMessage={
            workoutDocumentExerciseSetSegmentValidationErrorMessages?.weightValue
          }
          inputMode="decimal"
          label={workoutScreenMessages.weightValueLabel}
          onChangeText={(weightValue) => {
            handleChangeSegment({ weightValue });
          }}
          placeholder={weightValuePlaceholder}
          value={workoutDocumentExerciseSetSegment.weightValue}
        />
      ) : null}
      {workoutDocumentExerciseSetSegment.weightUnit ? (
        <PickerField
          label={workoutScreenMessages.weightUnitLabel}
          onChangeSelectedOption={(weightUnit) => {
            handleChangeSegment({ weightUnit });
          }}
          optionLabels={WEIGHT_UNIT_LABELS}
          options={WEIGHT_UNITS}
          selectedOption={workoutDocumentExerciseSetSegment.weightUnit}
        />
      ) : null}
    </>
  );
}

function WorkoutSet({
  dispatchWorkoutDocumentsAction,
  onStartRestTimer,
  setNumber,
  shouldShowValidationErrors,
  workoutDocumentExercise,
  workoutDocumentExerciseSet,
  workoutId,
}: WorkoutSetProperties) {
  const runtime = useRuntime();

  const workoutDocumentRoutineExerciseSet =
    getWorkoutDocumentRoutineExerciseSet({
      position: setNumber - 1,
      workoutDocumentExercise,
    });
  const variationSegmentCount = getVariationSegmentCount({
    variation: workoutDocumentExerciseSet.variation,
    workoutDocumentRoutineExerciseSet,
  });

  function handleAddSegment() {
    dispatchWorkoutDocumentsAction({
      type: "addedSegment",
      workoutExerciseId: workoutDocumentExercise.id,
      workoutExerciseSetId: workoutDocumentExerciseSet.id,
      workoutExerciseSetSegmentId: runtime.runSync(createIdentifier()),
      workoutId,
    });

    if (
      workoutDocumentExerciseSet.variation === "rest_pause" &&
      workoutDocumentRoutineExerciseSet?.restPauseRestSeconds !== undefined
    ) {
      onStartRestTimer(workoutDocumentRoutineExerciseSet.restPauseRestSeconds);
    }
  }

  return (
    <>
      <Text>
        {workoutDocumentExerciseSet.setType === "warm_up"
          ? workoutScreenMessages.warmUpSetLabel(setNumber)
          : workoutScreenMessages.setLabel(setNumber)}
      </Text>
      {workoutDocumentExerciseSet.variation ? (
        <Text>{VARIATION_LABELS[workoutDocumentExerciseSet.variation]}</Text>
      ) : null}
      {workoutDocumentExerciseSet.isToFailure ? (
        <Text>{workoutScreenMessages.toFailureLabel}</Text>
      ) : null}
      {workoutDocumentExerciseSet.tempo ? (
        <>
          <Text>
            {workoutScreenMessages.tempoLabel(workoutDocumentExerciseSet.tempo)}
          </Text>
          <Text>{workoutScreenMessages.tempoDescription}</Text>
        </>
      ) : null}
      {workoutDocumentExerciseSet.segments.map(
        (workoutDocumentExerciseSetSegment, segmentIndex) => (
          <WorkoutSegment
            amountPlaceholder={
              segmentIndex === 0
                ? workoutDocumentRoutineExerciseSet?.amount?.toString()
                : undefined
            }
            amountUnit={workoutDocumentExercise.amountUnit}
            dispatchWorkoutDocumentsAction={dispatchWorkoutDocumentsAction}
            key={workoutDocumentExerciseSetSegment.id}
            segmentLabel={
              workoutDocumentExerciseSet.variation
                ? workoutScreenMessages.segmentLabel(segmentIndex + 1)
                : undefined
            }
            shouldShowValidationErrors={shouldShowValidationErrors}
            weightType={workoutDocumentExercise.weightType}
            weightValuePlaceholder={
              workoutDocumentExerciseSet.variation === "drop_set" &&
              segmentIndex > 0
                ? getDropSetWeightValueSuggestion({
                    dropSetWeightPercentage:
                      workoutDocumentRoutineExerciseSet?.dropSetWeightPercentage,
                    previousWeightValueText:
                      workoutDocumentExerciseSet.segments[segmentIndex - 1]
                        .weightValue,
                  })
                : undefined
            }
            workoutDocumentExerciseSetSegment={
              workoutDocumentExerciseSetSegment
            }
            workoutExerciseId={workoutDocumentExercise.id}
            workoutExerciseSetId={workoutDocumentExerciseSet.id}
            workoutId={workoutId}
          />
        ),
      )}
      {workoutDocumentExerciseSet.variation &&
      variationSegmentCount !== undefined &&
      workoutDocumentExerciseSet.segments.length < variationSegmentCount ? (
        <Button
          onPress={handleAddSegment}
          title={
            ADD_SEGMENT_BUTTON_TITLES[workoutDocumentExerciseSet.variation]
          }
        />
      ) : null}
    </>
  );
}

function WorkoutTimers({
  onSkipRest,
  restTimer,
  startedAt,
}: WorkoutTimersProperties) {
  const currentTime = useCurrentTime();

  const elapsedSeconds = getElapsedSeconds({ currentTime, startedAt });
  const restRemainingSeconds = getRestRemainingSeconds({
    currentTime,
    restTimer,
  });

  return (
    <>
      <Text>
        {workoutScreenMessages.elapsedTimeStatus(
          formatElapsedTime(elapsedSeconds),
        )}
      </Text>
      {restRemainingSeconds > 0 ? (
        <>
          <Text>
            {workoutScreenMessages.restTimerStatus(restRemainingSeconds)}
          </Text>
          <Button
            onPress={onSkipRest}
            title={workoutScreenMessages.skipRestButton}
          />
        </>
      ) : null}
    </>
  );
}
