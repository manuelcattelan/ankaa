import type { SkipReason } from "@ankaa/core/features/workout/constants/skip-reasons";
import type { WeightUnit } from "@ankaa/core/features/workout/constants/weight";
import type { AmountUnit } from "@ankaa/core/shared/constants/amount";

import { formatCount } from "#/shared/core/format-count.ts";

const SECONDS_UNIT = { plural: "seconds", singular: "second" };

export const WORKOUT_MESSAGES = {
  addSegmentButton: "Add segment",
  amountInvalidError: (minimum: number) =>
    `This number isn't valid: enter a whole number of at least ${String(minimum)}.`,
  amountLabels: {
    repetition: "Repetitions",
    second: "Seconds",
  } satisfies Record<AmountUnit, string>,
  draftsUnsavedError: (draftLabels: string[]) =>
    `You haven't saved these: ${draftLabels.join("; ")}. Save them before you stop the workout.`,
  dropSetLabel: (weightPercentage: null | number) =>
    weightPercentage === null
      ? "Drop set"
      : `Drop set: take off ${String(weightPercentage)}% at each drop`,
  noteLabel: "Note for this workout",
  notSkippedLabel: "Not skipped",
  plannedAmountLabels: {
    repetition: (amount: number) =>
      formatCount({
        count: amount,
        plural: "repetitions",
        singular: "repetition",
      }),
    second: (amount: number) => formatCount({ count: amount, ...SECONDS_UNIT }),
  } satisfies Record<AmountUnit, (amount: number) => string>,
  plannedNoteLabel: (plannedNote: string) => `Routine note: ${plannedNote}`,
  recordedSetDraftInvalidError:
    "Some fields of this set aren't valid: correct the fields marked with an error.",
  removeSegmentButton: "Remove segment",
  removeSetButton: "Remove set",
  restLabel: (restSeconds: number) =>
    `Rest: ${formatCount({ count: restSeconds, ...SECONDS_UNIT })}`,
  restPauseSetLabel: ({
    pauseSeconds,
    segmentCount,
  }: {
    pauseSeconds: number;
    segmentCount: number;
  }) =>
    `Rest-pause set: ${String(segmentCount)} segments, with pauses of ${formatCount({ count: pauseSeconds, ...SECONDS_UNIT })}`,
  resumeWorkoutButton: "Resume workout",
  routineNotFoundError:
    "This routine doesn't exist anymore: start another routine.",
  saveNoteButton: "Save note",
  saveSetButton: "Save set",
  saveSkipButton: "Save skip",
  segmentCountInvalidError:
    "This set has more segments than planned: remove a segment and save the set again.",
  segmentLabel: (segmentNumber: number) => `Segment ${String(segmentNumber)}`,
  segmentWeightNotAllowedError:
    "This exercise takes no weight: clear the weight and save the set again.",
  skipNoteLabel: "Why you skipped it",
  skipNoteWithoutReasonError:
    "This note needs a reason: pick why you skipped the exercise, or clear the note.",
  skipReasonLabel: "Skipped",
  skipReasonLabels: {
    low_energy: "Low energy",
    low_on_time: "Low on time",
    other: "Other",
    pain: "Pain",
  } satisfies Record<SkipReason, string>,
  startWorkoutButton: (routineName: string) => `Start ${routineName}`,
  stopWorkoutButton: "Stop workout",
  tempoDescription:
    "The seconds for lowering, holding at the bottom, lifting and holding at the top. X means lifting as fast as you can.",
  tempoLabel: (tempo: string) => `Tempo ${tempo}`,
  toFailureLabel: "To failure",
  unsavedNoteLabel: (exerciseName: string) => `${exerciseName}, note`,
  unsavedSetLabel: ({
    exerciseName,
    setNumber,
  }: {
    exerciseName: string;
    setNumber: number;
  }) => `${exerciseName}, set ${String(setNumber)}`,
  unsavedSkipLabel: (exerciseName: string) => `${exerciseName}, skip`,
  warmUpSetLabel: (setNumber: number) => `Set ${String(setNumber)}, warm-up`,
  weightInvalidError: ({
    maximum,
    minimum,
  }: {
    maximum: number;
    minimum: number;
  }) =>
    `This weight isn't valid: enter a number from ${String(minimum)} to ${String(maximum)}, with at most two decimal places.`,
  weightLabels: {
    kilogram: "Weight, in kilograms",
    pound: "Weight, in pounds",
  } satisfies Record<WeightUnit, string>,
  weightUnitLabel: "Weight unit",
  weightUnitLabels: {
    kilogram: "Kilograms",
    pound: "Pounds",
  } satisfies Record<WeightUnit, string>,
  workingSetCounterStatus: ({
    doneCount,
    leftCount,
  }: {
    doneCount: number;
    leftCount: number;
  }) =>
    `${formatCount({ count: doneCount, plural: "working sets", singular: "working set" })} done, ${String(leftCount)} left.`,
  workoutInProgressConflictError:
    "You already have a workout in progress: resume it, or stop it before you start another.",
  workoutNotFoundError:
    "This workout isn't in progress anymore: go back to the home screen.",
  workoutNotInProgressStatus: "You have no workout in progress.",
  workoutScreenTitle: "Workout",
};
