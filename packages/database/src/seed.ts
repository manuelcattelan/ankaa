import { sql } from "drizzle-orm";

import { database } from "./index.ts";
import {
  exercise,
  exerciseEquipment,
  exerciseMuscleGroup,
} from "./schema/exercise.ts";

type ExerciseSeed = Pick<
  typeof exercise.$inferSelect,
  "amountUnit" | "id" | "name" | "weightType"
> & {
  exerciseEquipment: Pick<typeof exerciseEquipment.$inferSelect, "equipment">[];
  exerciseMuscleGroups: Pick<
    typeof exerciseMuscleGroup.$inferSelect,
    "muscleGroup" | "muscleGroupRole"
  >[];
};

const EXERCISE_SEEDS: ExerciseSeed[] = [
  {
    amountUnit: "repetition",
    exerciseEquipment: [
      { equipment: "barbell" },
      { equipment: "bench" },
      { equipment: "rack" },
    ],
    exerciseMuscleGroups: [
      { muscleGroup: "chest", muscleGroupRole: "primary" },
      { muscleGroup: "triceps", muscleGroupRole: "secondary" },
      { muscleGroup: "front_deltoid", muscleGroupRole: "secondary" },
    ],
    id: "01a116a3-0b0f-70ce-91c2-03ac50a49f4b",
    name: "Bench Press (Barbell)",
    weightType: "total",
  },
];

const nowSql = sql`now()`;

try {
  await database.transaction(async (transaction) => {
    for (const exerciseSeed of EXERCISE_SEEDS) {
      await transaction
        .insert(exercise)
        .values({
          amountUnit: exerciseSeed.amountUnit,
          id: exerciseSeed.id,
          name: exerciseSeed.name,
          weightType: exerciseSeed.weightType,
        })
        .onConflictDoUpdate({
          set: {
            amountUnit: exerciseSeed.amountUnit,
            name: exerciseSeed.name,
            updatedAt: nowSql,
            weightType: exerciseSeed.weightType,
          },
          target: exercise.id,
        });

      for (const exerciseMuscleGroupSeed of exerciseSeed.exerciseMuscleGroups) {
        await transaction
          .insert(exerciseMuscleGroup)
          .values({ ...exerciseMuscleGroupSeed, exerciseId: exerciseSeed.id })
          .onConflictDoUpdate({
            set: {
              muscleGroupRole: exerciseMuscleGroupSeed.muscleGroupRole,
              updatedAt: nowSql,
            },
            target: [
              exerciseMuscleGroup.exerciseId,
              exerciseMuscleGroup.muscleGroup,
            ],
          });
      }

      for (const exerciseEquipmentSeed of exerciseSeed.exerciseEquipment) {
        await transaction
          .insert(exerciseEquipment)
          .values({ ...exerciseEquipmentSeed, exerciseId: exerciseSeed.id })
          .onConflictDoUpdate({
            set: { updatedAt: nowSql },
            target: [exerciseEquipment.exerciseId, exerciseEquipment.equipment],
          });
      }
    }
  });
} finally {
  await database.$client.end();
}
