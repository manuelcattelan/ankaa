import type { RoutineDraft } from "@/features/routine/core/routine-draft-reducer";

import { getRoutineDraftExerciseSetValidationErrors } from "@/features/routine/core/get-routine-draft-exercise-set-validation-errors";
import { getRoutineDraftPlacedExercises } from "@/features/routine/core/get-routine-draft-placed-exercises";
import { getRoutineNameValidationError } from "@/features/routine/core/get-routine-name-validation-error";

export function hasRoutineDraftValidationErrors(routineDraft: RoutineDraft) {
  return (
    !!getRoutineNameValidationError(routineDraft.name) ||
    getRoutineDraftPlacedExercises(routineDraft).some(
      (routineDraftPlacedExercise) =>
        routineDraftPlacedExercise.routineDraftExercise.sets.some(
          (routineDraftExerciseSet) =>
            Object.values(
              getRoutineDraftExerciseSetValidationErrors(
                routineDraftExerciseSet,
              ),
            ).some((validationError) => !!validationError),
        ),
    )
  );
}
