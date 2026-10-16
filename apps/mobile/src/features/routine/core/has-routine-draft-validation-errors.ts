import * as Match from "effect/Match";

import type {
  RoutineDraft,
  RoutineDraftExerciseSet,
} from "@/features/routine/core/routine-draft-reducer";

import { getRoutineDraftPlacedExercises } from "@/features/routine/core/get-routine-draft-placed-exercises";
import { validateRoutineDraftExerciseSet } from "@/features/routine/core/validate-routine-draft-exercise-set";
import { validateRoutineName } from "@/features/routine/core/validate-routine-name";
import { isWholeNumberValid } from "@/shared/core/is-whole-number-valid";

export function hasRoutineDraftValidationErrors(routineDraft: RoutineDraft) {
  const isRoutineNameValid = Match.valueTags(
    validateRoutineName(routineDraft.name),
    {
      RoutineNameEmpty: () => false,
      RoutineNameValid: () => true,
    },
  );

  return (
    !isRoutineNameValid ||
    getRoutineDraftPlacedExercises(routineDraft).some(
      (routineDraftPlacedExercise) =>
        !routineDraftPlacedExercise.routineDraftExercise.sets.every(
          isRoutineDraftExerciseSetValid,
        ),
    )
  );
}

function isRoutineDraftExerciseSetValid(
  routineDraftExerciseSet: RoutineDraftExerciseSet,
) {
  const routineDraftExerciseSetValidationOutcomes =
    validateRoutineDraftExerciseSet(routineDraftExerciseSet);

  return (
    [
      routineDraftExerciseSetValidationOutcomes.amount,
      routineDraftExerciseSetValidationOutcomes.dropSetSegmentCount,
      routineDraftExerciseSetValidationOutcomes.dropSetWeightPercentage,
      routineDraftExerciseSetValidationOutcomes.restPauseRestSeconds,
      routineDraftExerciseSetValidationOutcomes.restPauseSegmentCount,
      routineDraftExerciseSetValidationOutcomes.restSeconds,
    ].every(isWholeNumberValid) &&
    Match.valueTags(routineDraftExerciseSetValidationOutcomes.tempo, {
      TempoFormatInvalid: () => false,
      TempoValid: () => true,
    })
  );
}
