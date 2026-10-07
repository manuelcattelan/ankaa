import { database } from "@ankaa/database";

import { protectedProcedure, router } from "../trpc.ts";

export const exerciseRouter = router({
  list: protectedProcedure.query(() =>
    database.query.exercise.findMany({
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
    }),
  ),
});
