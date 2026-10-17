import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { DAYS_OF_WEEK } from "@ankaa/core/features/routine/constants/day-of-week";

import type {
  RoutineDraft,
  RoutineDraftExerciseSet,
} from "@/features/routine/core/routine-draft-reducer";

import { formatTempo } from "@/features/routine/core/format-tempo";
import { getRoutineDraftPlacedExercises } from "@/features/routine/core/get-routine-draft-placed-exercises";
import { convertUndefinedToNull } from "@/shared/core/convert-undefined-to-null";
import { parseOptionalWholeNumber } from "@/shared/core/parse-optional-whole-number";

type BuildRoutineExerciseSetSaveInputOptions = {
  position: number;
  routineDraftExerciseSet: RoutineDraftExerciseSet;
};

type BuildRoutineSaveInputOptions = {
  routineDraft: RoutineDraft;
  routineId: string;
};

type RoutineExerciseSetSaveInput =
  RoutineSaveInput["exercises"][number]["sets"][number];

export function buildRoutineSaveInput({
  routineDraft,
  routineId,
}: BuildRoutineSaveInputOptions) {
  return {
    days: DAYS_OF_WEEK.filter((dayOfWeek) =>
      routineDraft.days.includes(dayOfWeek),
    ),
    exercises: getRoutineDraftPlacedExercises(routineDraft).map(
      (routineDraftPlacedExercise, position) => ({
        exerciseId: routineDraftPlacedExercise.routineDraftExercise.exerciseId,
        id: routineDraftPlacedExercise.routineDraftExercise.id,
        note: convertUndefinedToNull(
          routineDraftPlacedExercise.routineDraftExercise.note.trim() ||
            undefined,
        ),
        position,
        section: routineDraftPlacedExercise.section,
        sets: routineDraftPlacedExercise.routineDraftExercise.sets.map(
          (routineDraftExerciseSet, setPosition) =>
            buildRoutineExerciseSetSaveInput({
              position: setPosition,
              routineDraftExerciseSet,
            }),
        ),
        superset: convertUndefinedToNull(routineDraftPlacedExercise.superset),
        warmUpForRoutineExerciseId: convertUndefinedToNull(
          routineDraftPlacedExercise.warmUpForRoutineExerciseId,
        ),
      }),
    ),
    id: routineId,
    name: routineDraft.name.trim(),
  } satisfies RoutineSaveInput;
}

function buildRoutineExerciseSetSaveInput({
  position,
  routineDraftExerciseSet,
}: BuildRoutineExerciseSetSaveInputOptions) {
  const isRestPause = routineDraftExerciseSet.variation === "rest_pause";
  const isDropSet = routineDraftExerciseSet.variation === "drop_set";

  return {
    amount: parseOptionalWholeNumber(routineDraftExerciseSet.amount),
    dropSetSegmentCount: parseOptionalWholeNumber(
      isDropSet ? routineDraftExerciseSet.dropSetSegmentCount : undefined,
    ),
    dropSetWeightPercentage: parseOptionalWholeNumber(
      isDropSet ? routineDraftExerciseSet.dropSetWeightPercentage : undefined,
    ),
    id: routineDraftExerciseSet.id,
    isToFailure: routineDraftExerciseSet.isToFailure,
    position,
    restPauseRestSeconds: parseOptionalWholeNumber(
      isRestPause ? routineDraftExerciseSet.restPauseRestSeconds : undefined,
    ),
    restPauseSegmentCount: parseOptionalWholeNumber(
      isRestPause ? routineDraftExerciseSet.restPauseSegmentCount : undefined,
    ),
    restSeconds: parseOptionalWholeNumber(routineDraftExerciseSet.restSeconds),
    setType: routineDraftExerciseSet.setType,
    tempo: convertUndefinedToNull(
      formatTempo(routineDraftExerciseSet.tempo) || undefined,
    ),
    variation: convertUndefinedToNull(routineDraftExerciseSet.variation),
  } satisfies RoutineExerciseSetSaveInput;
}
