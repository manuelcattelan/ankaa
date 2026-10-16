import type { DrizzleDatabase } from "@ankaa/database";

import { eq } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type FindWorkoutWithSameIdOptions = {
  database: DrizzleDatabase;
  workoutId: string;
};

export async function findWorkoutWithSameId({
  database,
  workoutId,
}: FindWorkoutWithSameIdOptions) {
  const [workoutWithSameId] = await database
    .select({
      userId: DatabaseSchema.workout.userId,
      version: DatabaseSchema.workout.version,
    })
    .from(DatabaseSchema.workout)
    .where(eq(DatabaseSchema.workout.id, workoutId))
    .for("update");

  return workoutWithSameId;
}
