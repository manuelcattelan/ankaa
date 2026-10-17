import * as Match from "effect/Match";

import type {
  RoutineDraft,
  RoutineDraftExerciseSet,
} from "@/features/routine/core/routine-draft-reducer";

import { getRoutineDraftPlacedExercises } from "@/features/routine/core/get-routine-draft-placed-exercises";
import { validateRoutineDraftExerciseSet } from "@/features/routine/core/validate-routine-draft-exercise-set";
import { validateRoutineName } from "@/features/routine/core/validate-routine-name";

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
  return Match.valueTags(
    validateRoutineDraftExerciseSet(routineDraftExerciseSet),
    {
      RoutineDraftExerciseSetInvalid: () => false,
      RoutineDraftExerciseSetValid: () => true,
    },
  );
}
