import {
  AMOUNT_MINIMUM,
  SKIP_REASONS,
  WEIGHT_UNITS,
  WEIGHT_VALUE_MAXIMUM,
  WEIGHT_VALUE_MINIMUM,
} from "@ankaa/database/constants";
import { useQuery } from "@tanstack/react-query";
import * as ExpoNotifications from "expo-notifications";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
  WorkoutDocumentExerciseSetSegment,
  WorkoutDocumentRestTimer,
  WorkoutDocumentRoutineExerciseSet,
  WorkoutDocumentsAction,
} from "@/utilities/workout-documents";

import { useTrpc } from "@/clients/trpc";
import { useWorkoutDocuments } from "@/clients/workout-documents";
import { Button } from "@/components/button";
import { PickerField } from "@/components/picker-field";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { announceMessage } from "@/utilities/accessibility";
import { MILLISECONDS_PER_SECOND } from "@/utilities/constants";
import { parseWeightValue } from "@/utilities/conversion";
import { createIdentifier } from "@/utilities/identifiers";
import { messages } from "@/utilities/messages";
import {
  cancelRestNotification,
  scheduleRestNotification,
} from "@/utilities/notifications";
import { getWholeNumberValidationError } from "@/utilities/validation";
import { getWorkoutDocumentRoutineExerciseSet } from "@/utilities/workout-documents";

type AmountUnit = WorkoutDocumentExercise["amountUnit"];

type GetDropSetWeightValueSuggestionOptions = {
  dropSetWeightPercentage: number | undefined;
  previousWeightValueText: string;
};

type GetVariationSegmentCountOptions = {
  variation: undefined | Variation;
  workoutDocumentRoutineExerciseSet:
    undefined | WorkoutDocumentRoutineExerciseSet;
};

type GetWorkoutExercisePlacementOptions = {
  exerciseIndex: number;
  workoutDocumentExercises: WorkoutDocumentExercise[];
};

type Section = WorkoutDocumentExercise["section"];

type SkipReason = (typeof SKIP_REASONS)[number];

type SkipReasonPickerValue = SkipReason | typeof NO_SKIP_REASON_PICKER_VALUE;

type Variation = NonNullable<WorkoutDocumentExerciseSet["variation"]>;

type WeightType = WorkoutDocumentExercise["weightType"];

type WeightUnit = (typeof WEIGHT_UNITS)[number];

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

const NO_SKIP_REASON_PICKER_VALUE = "none";

const CURRENT_TIME_INTERVAL_MILLISECONDS = 1_000;

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const ELAPSED_TIME_PART_LENGTH = 2;

const PERCENTAGE_TOTAL = 100;
const WEIGHT_VALUE_DECIMAL_PLACES = 2;

const ADD_SEGMENT_BUTTON_TITLES = {
  drop_set: messages.workout.addDropSetSegmentButton,
  rest_pause: messages.workout.addRestPauseSegmentButton,
} satisfies Record<Variation, string>;

const AMOUNT_UNIT_LABELS = {
  repetition: messages.workout.repetitionAmountLabel,
  second: messages.workout.secondAmountLabel,
} satisfies Record<AmountUnit, string>;

const SECTION_LABELS = {
  cool_down: messages.workout.coolDownSectionLabel,
  main: messages.workout.mainSectionLabel,
  warm_up: messages.workout.warmUpSectionLabel,
} satisfies Record<Section, string>;

const SKIP_REASON_PICKER_LABELS = {
  low_energy: messages.workout.lowEnergySkipReasonLabel,
  low_on_time: messages.workout.lowOnTimeSkipReasonLabel,
  none: messages.workout.noSkipReasonLabel,
  ["other"]: messages.workout.otherSkipReasonLabel,
  pain: messages.workout.painSkipReasonLabel,
} satisfies Record<SkipReasonPickerValue, string>;

const SKIP_REASON_PICKER_OPTIONS: SkipReasonPickerValue[] = [
  NO_SKIP_REASON_PICKER_VALUE,
  ...SKIP_REASONS,
];

const VARIATION_LABELS = {
  drop_set: messages.workout.dropSetVariationLabel,
  rest_pause: messages.workout.restPauseVariationLabel,
} satisfies Record<Variation, string>;

const WEIGHT_TYPE_DESCRIPTIONS = {
  assisted: messages.workout.assistedWeightTypeDescription,
  bodyweight: messages.workout.bodyweightWeightTypeDescription,
  single: messages.workout.singleWeightTypeDescription,
  total: messages.workout.totalWeightTypeDescription,
} satisfies Record<Exclude<WeightType, "none">, string>;

const WEIGHT_UNIT_LABELS = {
  kilogram: messages.workout.kilogramWeightUnitLabel,
  pound: messages.workout.poundWeightUnitLabel,
} satisfies Record<WeightUnit, string>;

export default function WorkoutScreen() {
  const workoutDocuments = useWorkoutDocuments();

  if (!workoutDocuments.runningWorkoutDocument) {
    return <Redirect href="/" />;
  }

  return (
    <WorkoutContent workoutDocument={workoutDocuments.runningWorkoutDocument} />
  );
}

async function cancelRestTimerNotification(
  restTimer: undefined | WorkoutDocumentRestTimer,
) {
  if (restTimer?.restNotificationId === undefined) {
    return;
  }

  await cancelRestNotification({
    restNotificationId: restTimer.restNotificationId,
  });
}

function formatElapsedTime(elapsedSeconds: number) {
  const elapsedHours = Math.floor(elapsedSeconds / SECONDS_PER_HOUR);
  const elapsedMinutes =
    Math.floor(elapsedSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
  const elapsedSecondsOfMinute = elapsedSeconds % SECONDS_PER_MINUTE;

  return `${elapsedHours}:${formatElapsedTimePart(elapsedMinutes)}:${formatElapsedTimePart(elapsedSecondsOfMinute)}`;
}

function formatElapsedTimePart(elapsedTimePart: number) {
  return elapsedTimePart.toString().padStart(ELAPSED_TIME_PART_LENGTH, "0");
}

function getDropSetWeightValueSuggestion({
  dropSetWeightPercentage,
  previousWeightValueText,
}: GetDropSetWeightValueSuggestionOptions) {
  const previousWeightValue = parseWeightValue(previousWeightValueText);

  if (
    dropSetWeightPercentage === undefined ||
    previousWeightValue === undefined
  ) {
    return undefined;
  }

  const suggestedWeightValue = Number(
    (
      (previousWeightValue * (PERCENTAGE_TOTAL - dropSetWeightPercentage)) /
      PERCENTAGE_TOTAL
    ).toFixed(WEIGHT_VALUE_DECIMAL_PLACES),
  );

  return suggestedWeightValue >= WEIGHT_VALUE_MINIMUM
    ? suggestedWeightValue.toString()
    : undefined;
}

function getVariationSegmentCount({
  variation,
  workoutDocumentRoutineExerciseSet,
}: GetVariationSegmentCountOptions) {
  if (variation === "rest_pause") {
    return workoutDocumentRoutineExerciseSet?.restPauseSegmentCount;
  }

  if (variation === "drop_set") {
    return workoutDocumentRoutineExerciseSet?.dropSetSegmentCount;
  }

  return undefined;
}

function getWorkoutDocumentExerciseBlockSection(
  workoutDocumentExercise: WorkoutDocumentExercise,
) {
  return workoutDocumentExercise.warmUpForWorkoutExerciseId === undefined
    ? workoutDocumentExercise.section
    : "main";
}

function getWorkoutDocumentExerciseSetSegmentValidationErrors(
  workoutDocumentExerciseSetSegment: WorkoutDocumentExerciseSetSegment,
) {
  const hasInvalidWeightValue =
    !!workoutDocumentExerciseSetSegment.weightValue.trim() &&
    parseWeightValue(workoutDocumentExerciseSetSegment.weightValue) ===
      undefined;

  return {
    amount: getWholeNumberValidationError({
      isRequired: false,
      minimum: AMOUNT_MINIMUM,
      wholeNumberText: workoutDocumentExerciseSetSegment.amount,
    }),
    weightValue: hasInvalidWeightValue
      ? messages.workout.weightValueRangeError({
          maximum: WEIGHT_VALUE_MAXIMUM,
          minimum: WEIGHT_VALUE_MINIMUM,
        })
      : undefined,
  };
}

function getWorkoutExercisePlacement({
  exerciseIndex,
  workoutDocumentExercises,
}: GetWorkoutExercisePlacementOptions) {
  const workoutDocumentExercise = workoutDocumentExercises[exerciseIndex];
  const previousWorkoutDocumentExercise =
    exerciseIndex === 0
      ? undefined
      : workoutDocumentExercises[exerciseIndex - 1];
  const nextWorkoutDocumentExercise = workoutDocumentExercises.at(
    exerciseIndex + 1,
  );

  return {
    isLastExerciseOfRound:
      workoutDocumentExercise.superset === undefined ||
      nextWorkoutDocumentExercise?.superset !==
        workoutDocumentExercise.superset,
    isSectionStart:
      !previousWorkoutDocumentExercise ||
      getWorkoutDocumentExerciseBlockSection(
        previousWorkoutDocumentExercise,
      ) !== getWorkoutDocumentExerciseBlockSection(workoutDocumentExercise),
    isSupersetStart:
      workoutDocumentExercise.superset !== undefined &&
      previousWorkoutDocumentExercise?.superset !==
        workoutDocumentExercise.superset,
  };
}

function hasWorkoutDocumentValidationErrors(workoutDocument: WorkoutDocument) {
  return workoutDocument.exercises.some((workoutDocumentExercise) =>
    workoutDocumentExercise.sets.some((workoutDocumentExerciseSet) =>
      workoutDocumentExerciseSet.segments.some(
        (workoutDocumentExerciseSetSegment) =>
          Object.values(
            getWorkoutDocumentExerciseSetSegmentValidationErrors(
              workoutDocumentExerciseSetSegment,
            ),
          ).some((validationError) => !!validationError),
      ),
    ),
  );
}

async function scheduleRestTimerNotification(restSeconds: number) {
  const notificationPermission = await ExpoNotifications.getPermissionsAsync();

  if (!notificationPermission.granted) {
    return undefined;
  }

  return scheduleRestNotification({ restSeconds });
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

  const trpc = useTrpc();

  const workoutDocuments = useWorkoutDocuments();

  const [shouldShowValidationErrors, setShouldShowValidationErrors] =
    useState(false);

  const exerciseLibrary = useQuery(trpc.exercise.list.queryOptions());

  const exerciseNames = new Map(
    exerciseLibrary.data?.map(
      (exercise) => [exercise.id, exercise.name] as const,
    ),
  );
  const isWorkoutDocumentInvalid =
    shouldShowValidationErrors &&
    hasWorkoutDocumentValidationErrors(workoutDocument);

  function getWarmUpForExerciseName(
    workoutDocumentExercise: WorkoutDocumentExercise,
  ) {
    if (workoutDocumentExercise.warmUpForWorkoutExerciseId === undefined) {
      return undefined;
    }

    const warmUpForWorkoutDocumentExercise = workoutDocument.exercises.find(
      (linkedWorkoutDocumentExercise) =>
        linkedWorkoutDocumentExercise.id ===
        workoutDocumentExercise.warmUpForWorkoutExerciseId,
    );

    return (
      exerciseNames.get(warmUpForWorkoutDocumentExercise?.exerciseId ?? "") ??
      ""
    );
  }

  function handleSkipRest() {
    void cancelRestTimerNotification(workoutDocument.restTimer);

    workoutDocuments.dispatchWorkoutDocumentsAction({
      type: "skippedRest",
      workoutId: workoutDocument.id,
    });
  }

  async function handleStartRestTimer(restSeconds: number) {
    const restTimerStartedAt = new Date().toISOString();

    await cancelRestTimerNotification(workoutDocument.restTimer);

    const restNotificationId = await scheduleRestTimerNotification(restSeconds);

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
      announceMessage(messages.workout.workoutInvalidError);

      return;
    }

    void cancelRestTimerNotification(workoutDocument.restTimer);

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
              warmUpForExerciseName={getWarmUpForExerciseName(
                workoutDocumentExercise,
              )}
              workoutDocumentExercise={workoutDocumentExercise}
              workoutId={workoutDocument.id}
            />
          );
        },
      )}
      <Button
        onPress={handleStopWorkout}
        title={messages.workout.stopWorkoutButton}
      />
      <StatusMessage
        message={
          isWorkoutDocumentInvalid
            ? messages.workout.workoutInvalidError
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
  const nextWorkoutDocumentRoutineExerciseSet =
    getWorkoutDocumentRoutineExerciseSet({
      position: workoutDocumentExercise.sets.length,
      workoutDocumentExercise,
    });
  const restSeconds = isLastExerciseOfRound
    ? nextWorkoutDocumentRoutineExerciseSet?.restSeconds
    : undefined;
  const workingSetDoneCount = workoutDocumentExercise.sets.filter(
    (workoutDocumentExerciseSet) =>
      workoutDocumentExerciseSet.setType === "working",
  ).length;
  const workingSetPlannedCount =
    workoutDocumentExercise.routineExerciseSets.filter(
      (workoutDocumentRoutineExerciseSet) =>
        workoutDocumentRoutineExerciseSet.setType === "working",
    ).length;

  function handleAddSet() {
    dispatchWorkoutDocumentsAction({
      type: "addedSet",
      workoutExerciseId: workoutDocumentExercise.id,
      workoutExerciseSetId: createIdentifier(),
      workoutExerciseSetSegmentId: createIdentifier(),
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
    skipReasonPickerValue: SkipReasonPickerValue,
  ) {
    dispatchWorkoutDocumentsAction({
      skipReason:
        skipReasonPickerValue === NO_SKIP_REASON_PICKER_VALUE
          ? undefined
          : skipReasonPickerValue,
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
      {isSupersetStart ? <Text>{messages.workout.supersetLabel}</Text> : null}
      <Text>{exerciseName}</Text>
      {typeof warmUpForExerciseName === "string" ? (
        <Text>
          {messages.workout.warmUpForExerciseLabel(warmUpForExerciseName)}
        </Text>
      ) : null}
      {workoutDocumentExercise.routineExerciseNote ? (
        <Text>
          {messages.workout.routineExerciseNoteLabel(
            workoutDocumentExercise.routineExerciseNote,
          )}
        </Text>
      ) : null}
      {workoutDocumentExercise.weightType !== "none" ? (
        <Text>
          {WEIGHT_TYPE_DESCRIPTIONS[workoutDocumentExercise.weightType]}
        </Text>
      ) : null}
      <Text>
        {messages.workout.setCounterStatus({
          workingSetDoneCount,
          workingSetLeftCount: Math.max(
            0,
            workingSetPlannedCount - workingSetDoneCount,
          ),
        })}
      </Text>
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
          title={messages.workout.startRestButton}
        />
      ) : null}
      <Button onPress={handleAddSet} title={messages.workout.addSetButton} />
      <Button
        disabled={workoutDocumentExercise.sets.length === 0}
        onPress={handleRemoveSet}
        title={messages.workout.removeSetButton}
      />
      <TextField
        label={messages.workout.exerciseNoteLabel}
        multiline
        onChangeText={handleChangeNote}
        value={workoutDocumentExercise.note}
      />
      <PickerField
        label={messages.workout.skipReasonLabel}
        onChangeSelectedValue={handleChangeSkipReason}
        optionLabels={SKIP_REASON_PICKER_LABELS}
        options={SKIP_REASON_PICKER_OPTIONS}
        selectedValue={
          workoutDocumentExercise.skipReason ?? NO_SKIP_REASON_PICKER_VALUE
        }
      />
      {workoutDocumentExercise.skipReason ? (
        <TextField
          label={messages.workout.skipReasonNoteLabel}
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
  const validationErrors = shouldShowValidationErrors
    ? getWorkoutDocumentExerciseSetSegmentValidationErrors(
        workoutDocumentExerciseSetSegment,
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
        errorMessage={validationErrors?.amount}
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
          errorMessage={validationErrors?.weightValue}
          inputMode="decimal"
          label={messages.workout.weightValueLabel}
          onChangeText={(weightValue) => {
            handleChangeSegment({ weightValue });
          }}
          placeholder={weightValuePlaceholder}
          value={workoutDocumentExerciseSetSegment.weightValue}
        />
      ) : null}
      {workoutDocumentExerciseSetSegment.weightUnit ? (
        <PickerField
          label={messages.workout.weightUnitLabel}
          onChangeSelectedValue={(weightUnit) => {
            handleChangeSegment({ weightUnit });
          }}
          optionLabels={WEIGHT_UNIT_LABELS}
          options={WEIGHT_UNITS}
          selectedValue={workoutDocumentExerciseSetSegment.weightUnit}
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
      workoutExerciseSetSegmentId: createIdentifier(),
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
          ? messages.workout.warmUpSetLabel(setNumber)
          : messages.workout.setLabel(setNumber)}
      </Text>
      {workoutDocumentExerciseSet.variation ? (
        <Text>{VARIATION_LABELS[workoutDocumentExerciseSet.variation]}</Text>
      ) : null}
      {workoutDocumentExerciseSet.isToFailure ? (
        <Text>{messages.workout.toFailureLabel}</Text>
      ) : null}
      {workoutDocumentExerciseSet.tempo ? (
        <>
          <Text>
            {messages.workout.tempoLabel(workoutDocumentExerciseSet.tempo)}
          </Text>
          <Text>{messages.workout.tempoDescription}</Text>
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
                ? messages.workout.segmentLabel(segmentIndex + 1)
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

  const elapsedSeconds = Math.max(
    0,
    Math.floor((currentTime - Date.parse(startedAt)) / MILLISECONDS_PER_SECOND),
  );
  const restRemainingSeconds = restTimer
    ? Math.ceil(
        (Date.parse(restTimer.startedAt) +
          restTimer.restSeconds * MILLISECONDS_PER_SECOND -
          currentTime) /
          MILLISECONDS_PER_SECOND,
      )
    : 0;

  return (
    <>
      <Text>
        {messages.workout.elapsedTimeStatus(formatElapsedTime(elapsedSeconds))}
      </Text>
      {restRemainingSeconds > 0 ? (
        <>
          <Text>{messages.workout.restTimerStatus(restRemainingSeconds)}</Text>
          <Button
            onPress={onSkipRest}
            title={messages.workout.skipRestButton}
          />
        </>
      ) : null}
    </>
  );
}
