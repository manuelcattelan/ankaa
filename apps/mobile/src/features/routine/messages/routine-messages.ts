import type { DayOfWeek } from "@ankaa/core/features/routine/constants/days-of-week";
import type { SetType } from "@ankaa/core/shared/constants/set-types";

export const ROUTINE_MESSAGES = {
  addExerciseButton: "Add exercise",
  addSetButton: "Add set",
  addWarmUpExerciseButton: "Add warm-up exercise",
  amountLabel: "Repetitions or seconds",
  dayOfWeekLabels: {
    friday: "Friday",
    monday: "Monday",
    saturday: "Saturday",
    sunday: "Sunday",
    thursday: "Thursday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
  } satisfies Record<DayOfWeek, string>,
  daysLabel: "Days",
  deleteRoutineButton: "Delete routine",
  dropSetSegmentCountLabel: "Segments, the first included",
  dropSetWeightPercentageLabel: "Weight to drop each time, in percent",
  exerciseNoteLabel: "Note",
  intensityTechniqueLabel: "Intensity technique",
  intensityTechniqueLabels: {
    DropSet: "Drop set",
    none: "None",
    RestPauseSet: "Rest-pause set",
  } satisfies Record<"DropSet" | "none" | "RestPauseSet", string>,
  joinSupersetButton: "Superset with next exercise",
  leaveSupersetButton: "Leave superset",
  mainRoutineExerciseMissingError:
    "This routine has no exercise in the main section: add an exercise to the main section.",
  moveDownButton: "Move down",
  moveUpButton: "Move up",
  newRoutineButton: "New routine",
  newRoutineScreenTitle: "New routine",
  pauseSecondsLabel: "Pause, in seconds",
  removeExerciseButton: "Remove exercise",
  removeSetButton: "Remove set",
  restPauseSetSegmentCountLabel: "Segments, the first included",
  restSecondsLabel: "Rest after the set, in seconds",
  routineDraftInvalidError:
    "Some fields aren't valid: correct the fields marked with an error.",
  routineListEmptyStatus: "You have no routines yet.",
  routineNameEmptyError: "This routine has no name: enter a name.",
  routineNameLabel: "Name",
  routineNameTakenError:
    "You already have a routine with this name: enter another name.",
  routineNotFoundError:
    "This routine doesn't exist anymore: go back to your routines.",
  routineScreenTitle: "Routine",
  saveRoutineButton: "Save routine",
  setTypeLabel: "Set type",
  setTypeLabels: {
    warm_up: "Warm-up",
    working: "Working",
  } satisfies Record<SetType, string>,
  tempoInvalidError:
    "This tempo isn't valid: enter four numbers separated by hyphens, like 3-0-1-2, with X allowed only as the third.",
  tempoLabel: "Tempo",
  toFailureLabel: "To failure",
  wholeNumberBelowMinimumError: (minimum: number) =>
    `This number isn't valid: enter a whole number of at least ${String(minimum)}.`,
  wholeNumberOutOfRangeError: ({
    maximum,
    minimum,
  }: {
    maximum: number;
    minimum: number;
  }) =>
    `This number isn't valid: enter a whole number from ${String(minimum)} to ${String(maximum)}.`,
};
