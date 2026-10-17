import type { Variation } from "@ankaa/core/shared/constants/intensity-technique";

import type { WorkoutDocumentRoutineExerciseSet } from "@/features/workout/core/workout-document-schema";

type GetVariationSegmentCountOptions = {
  variation: undefined | Variation;
  workoutDocumentRoutineExerciseSet:
    undefined | WorkoutDocumentRoutineExerciseSet;
};

export function getVariationSegmentCount({
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
