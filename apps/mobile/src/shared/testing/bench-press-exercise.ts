import type { Exercise } from "@/shared/interactors/list-exercises";

export const benchPressExercise: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [{ equipment: "barbell" }, { equipment: "bench" }],
  exerciseMuscleGroups: [{ muscleGroup: "chest", muscleGroupRole: "primary" }],
  id: "01900000-0000-7000-8000-000000000001",
  name: "Bench Press (Barbell)",
  weightType: "total",
};
