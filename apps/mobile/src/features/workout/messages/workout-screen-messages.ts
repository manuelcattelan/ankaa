import { formatCount } from "@/shared/core/format-count";

type SetCounterStatusOptions = {
  workingSetDoneCount: number;
  workingSetLeftCount: number;
};

type WeightValueOutOfRangeErrorOptions = {
  maximum: number;
  minimum: number;
};

const SECONDS_UNIT = { plural: "seconds", singular: "second" };

export const workoutScreenMessages = {
  addDropSetSegmentButton: "Add drop",
  addRestPauseSegmentButton: "Add rest-pause segment",
  addSetButton: "Add set",
  assistedWeightTypeDescription: "Enter the weight taken off your body weight.",
  bodyweightWeightTypeDescription:
    "Enter the weight added to your body weight, or leave it empty for your body weight only.",
  coolDownSectionLabel: "Cool-down",
  dropSetVariationLabel: "Drop set",
  elapsedTimeStatus: (elapsedTime: string) => `Elapsed time: ${elapsedTime}`,
  exerciseNoteLabel: "Note for this workout",
  kilogramWeightUnitLabel: "Kilograms",
  lowEnergySkipReasonLabel: "Low energy",
  lowOnTimeSkipReasonLabel: "Low on time",
  mainSectionLabel: "Main",
  noSkipReasonLabel: "Not skipped",
  otherSkipReasonLabel: "Other",
  painSkipReasonLabel: "Pain",
  poundWeightUnitLabel: "Pounds",
  removeSetButton: "Remove set",
  repetitionAmountLabel: "Repetitions",
  restPauseVariationLabel: "Rest-pause",
  restTimerStatus: (restRemainingSeconds: number) =>
    `Rest: ${formatCount({ count: restRemainingSeconds, ...SECONDS_UNIT })} left.`,
  routineExerciseNoteLabel: (routineExerciseNote: string) =>
    `Routine note: ${routineExerciseNote}`,
  secondAmountLabel: "Seconds",
  segmentLabel: (segmentNumber: number) => `Segment ${segmentNumber}`,
  setCounterStatus: ({
    workingSetDoneCount,
    workingSetLeftCount,
  }: SetCounterStatusOptions) =>
    `${formatCount({ count: workingSetDoneCount, plural: "working sets", singular: "working set" })} done, ${workingSetLeftCount} left.`,
  setLabel: (setNumber: number) => `Set ${setNumber}`,
  singleWeightTypeDescription: "Enter the weight of one dumbbell or one side.",
  skipReasonLabel: "Skipped",
  skipReasonNoteLabel: "Why you skipped it",
  skipRestButton: "Skip rest",
  startRestButton: "Start rest",
  stopWorkoutButton: "Stop workout",
  supersetLabel: "Superset",
  tempoDescription:
    "The seconds for lowering, pausing at the bottom, lifting and pausing at the top. X means lifting as fast as you can.",
  tempoLabel: (tempo: string) => `Tempo ${tempo}`,
  title: "Workout",
  toFailureLabel: "To failure",
  totalWeightTypeDescription: "Enter everything you lift.",
  warmUpForExerciseLabel: (exerciseName: string) =>
    `Warm-up for ${exerciseName}`,
  warmUpSectionLabel: "Warm-up",
  warmUpSetLabel: (setNumber: number) => `Set ${setNumber}, warm-up`,
  weightUnitLabel: "Weight unit",
  weightValueLabel: "Weight",
  weightValueOutOfRangeError: ({
    maximum,
    minimum,
  }: WeightValueOutOfRangeErrorOptions) =>
    `This weight isn't valid: enter a number from ${minimum} to ${maximum}, with at most two decimal places.`,
  workoutInvalidError:
    "Some fields aren't valid: correct the fields marked with an error.",
};
