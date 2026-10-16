import type { DrizzleDatabase } from "@ankaa/database";

import { and, eq, isNull, ne } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type FindWorkoutsInProgressOptions = {
  database: DrizzleDatabase;
  userId: string;
  workoutId: string;
};

export async function findWorkoutsInProgress({
  database,
  userId,
  workoutId,
}: FindWorkoutsInProgressOptions) {
  return database
    .select({ id: DatabaseSchema.workout.id })
    .from(DatabaseSchema.workout)
    .where(
      and(
        eq(DatabaseSchema.workout.userId, userId),
        isNull(DatabaseSchema.workout.endedAt),
        ne(DatabaseSchema.workout.id, workoutId),
      ),
    );
}
