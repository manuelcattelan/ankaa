import type { DrizzleDatabase } from "@ankaa/database";

export async function findExercises(database: DrizzleDatabase) {
  return database.query.exercise.findMany({
    columns: { amountUnit: true, id: true, name: true, weightType: true },
    orderBy: { name: "asc" },
    with: {
      exerciseEquipment: {
        columns: { equipment: true },
        orderBy: { equipment: "asc" },
      },
      exerciseMuscleGroups: {
        columns: { muscleGroup: true, muscleGroupRole: true },
        orderBy: { muscleGroup: "asc" },
      },
    },
  });
}
