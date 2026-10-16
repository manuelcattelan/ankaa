import type { Equipment } from "@ankaa/core/features/exercise/constants/equipment";
import type { MuscleGroup } from "@ankaa/core/features/exercise/constants/muscle-group";

import type { Exercise } from "@/shared/interactors/list-exercises";

type FilterExercisesOptions = {
  equipmentFilter: Equipment[];
  exerciseNameFilter: string;
  exercises: Exercise[];
  muscleGroupFilter: MuscleGroup[];
};

const EXERCISE_NAME_FILTER_WORD_SEPARATOR = /\s+/;

export function filterExercises({
  equipmentFilter,
  exerciseNameFilter,
  exercises,
  muscleGroupFilter,
}: FilterExercisesOptions) {
  const exerciseNameFilterWords = exerciseNameFilter
    .trim()
    .toLowerCase()
    .split(EXERCISE_NAME_FILTER_WORD_SEPARATOR);

  return exercises.filter((exercise) => {
    const exerciseName = exercise.name.toLowerCase();

    const hasExerciseNameMatch = exerciseNameFilterWords.every(
      (exerciseNameFilterWord) => exerciseName.includes(exerciseNameFilterWord),
    );
    const hasMuscleGroupMatch =
      muscleGroupFilter.length === 0 ||
      exercise.exerciseMuscleGroups.some((exerciseMuscleGroup) =>
        muscleGroupFilter.includes(exerciseMuscleGroup.muscleGroup),
      );
    const hasEquipmentMatch =
      equipmentFilter.length === 0 ||
      exercise.exerciseEquipment.every((exerciseEquipment) =>
        equipmentFilter.includes(exerciseEquipment.equipment),
      );

    return hasExerciseNameMatch && hasMuscleGroupMatch && hasEquipmentMatch;
  });
}
