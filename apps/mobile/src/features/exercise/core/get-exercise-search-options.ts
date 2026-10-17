import type { Exercise } from "@/shared/interactors/list-exercises";

export function getExerciseSearchOptions(exercises: Exercise[]) {
  return {
    equipmentOptions: [
      ...new Set(
        exercises.flatMap((exercise) =>
          exercise.exerciseEquipment.map(
            (exerciseEquipment) => exerciseEquipment.equipment,
          ),
        ),
      ),
    ],
    muscleGroupOptions: [
      ...new Set(
        exercises.flatMap((exercise) =>
          exercise.exerciseMuscleGroups.map(
            (exerciseMuscleGroup) => exerciseMuscleGroup.muscleGroup,
          ),
        ),
      ),
    ],
  };
}
