import type { Equipment } from "@ankaa/core/features/exercise/constants/equipment";
import type { MuscleGroup } from "@ankaa/core/features/exercise/constants/muscle-group";

export const EXERCISE_MESSAGES = {
  equipmentLabel: "Equipment",
  equipmentLabels: {
    barbell: "Barbell",
    bench: "Bench",
    rack: "Rack",
  } satisfies Record<Equipment, string>,
  listEmptyStatus: "No exercises match your filters.",
  muscleGroupLabels: {
    chest: "Chest",
    front_deltoid: "Front deltoid",
    triceps: "Triceps",
  } satisfies Record<MuscleGroup, string>,
  muscleGroupsLabel: "Muscle groups",
  nameLabel: "Exercise name",
};
