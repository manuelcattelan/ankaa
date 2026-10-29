import type { Equipment } from "@ankaa/core/features/exercise/constants/equipment";
import type { MuscleGroup } from "@ankaa/core/features/exercise/constants/muscle-group";

import type { Exercise } from "#/shared/exercise-application-service.ts";

type SearchExercisesOptions = {
  equipmentSelection: Equipment[];
  exerciseNameSearchText: string;
  exercises: Exercise[];
  muscleGroupSelection: MuscleGroup[];
};

const EXERCISE_NAME_SEARCH_WORD_SEPARATOR = /\s+/;

export function searchExercises({
  equipmentSelection,
  exerciseNameSearchText,
  exercises,
  muscleGroupSelection,
}: SearchExercisesOptions) {
  const exerciseNameSearchWords = exerciseNameSearchText
    .trim()
    .toLowerCase()
    .split(EXERCISE_NAME_SEARCH_WORD_SEPARATOR);

  return exercises.filter((exercise) => {
    const exerciseName = exercise.name.toLowerCase();

    const hasExerciseNameMatch = exerciseNameSearchWords.every(
      (exerciseNameSearchWord) => exerciseName.includes(exerciseNameSearchWord),
    );
    const hasMuscleGroupMatch =
      muscleGroupSelection.length === 0 ||
      exercise.muscleGroups.some((exerciseMuscleGroup) =>
        muscleGroupSelection.includes(exerciseMuscleGroup.muscleGroup),
      );
    const hasEquipmentMatch =
      equipmentSelection.length === 0 ||
      exercise.equipment.some((exerciseEquipment) =>
        equipmentSelection.includes(exerciseEquipment.equipment),
      );

    return hasExerciseNameMatch && hasMuscleGroupMatch && hasEquipmentMatch;
  });
}
