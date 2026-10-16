import type { DrizzleDatabase } from "@ankaa/database";

import * as WorkoutDatabaseSchema from "@ankaa/database/schema/workout";
import { and, eq, isNull, ne } from "drizzle-orm";

type FindWorkoutInProgressOptions = {
  database: DrizzleDatabase;
  userId: string;
  workoutId: string;
};

export async function findWorkoutInProgress({
  database,
  userId,
  workoutId,
}: FindWorkoutInProgressOptions) {
  const [workoutInProgress] = await database
    .select({ id: WorkoutDatabaseSchema.workout.id })
    .from(WorkoutDatabaseSchema.workout)
    .where(
      and(
        eq(WorkoutDatabaseSchema.workout.userId, userId),
        isNull(WorkoutDatabaseSchema.workout.endedAt),
        ne(WorkoutDatabaseSchema.workout.id, workoutId),
      ),
    )
    .limit(1);

  return workoutInProgress;
}
