import type { Exercise } from "#/shared/exercise-application-service.ts";

export function getExerciseSearchOptions(exercises: Exercise[]) {
  return {
    equipment: [
      ...new Set(
        exercises.flatMap((exercise) =>
          exercise.equipment.map(
            (exerciseEquipment) => exerciseEquipment.equipment,
          ),
        ),
      ),
    ],
    muscleGroups: [
      ...new Set(
        exercises.flatMap((exercise) =>
          exercise.muscleGroups.map(
            (exerciseMuscleGroup) => exerciseMuscleGroup.muscleGroup,
          ),
        ),
      ),
    ],
  };
}
