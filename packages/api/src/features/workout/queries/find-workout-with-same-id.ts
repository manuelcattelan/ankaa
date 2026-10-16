import type { DrizzleDatabase } from "@ankaa/database";

import * as WorkoutDatabaseSchema from "@ankaa/database/schema/workout";
import { eq } from "drizzle-orm";

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
      userId: WorkoutDatabaseSchema.workout.userId,
      version: WorkoutDatabaseSchema.workout.version,
    })
    .from(WorkoutDatabaseSchema.workout)
    .where(eq(WorkoutDatabaseSchema.workout.id, workoutId))
    .for("update");

  return workoutWithSameId;
}
