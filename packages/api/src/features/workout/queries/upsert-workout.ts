import type { DrizzleDatabase } from "@ankaa/database";

import { and, eq, lt, sql } from "@ankaa/database/operators";
import * as DatabaseSchema from "@ankaa/database/schema";

type UpsertWorkoutOptions = {
  database: DrizzleDatabase;
  workoutRow: WorkoutRow;
};

type WorkoutRow = typeof DatabaseSchema.workout.$inferInsert;

export async function upsertWorkout({
  database,
  workoutRow,
}: UpsertWorkoutOptions) {
  await database
    .insert(DatabaseSchema.workout)
    .values(workoutRow)
    .onConflictDoUpdate({
      set: {
        endedAt: workoutRow.endedAt,
        routineId: workoutRow.routineId,
        startedAt: workoutRow.startedAt,
        updatedAt: sql`now()`,
        version: workoutRow.version,
      },
      setWhere: and(
        eq(DatabaseSchema.workout.userId, workoutRow.userId),
        lt(DatabaseSchema.workout.version, workoutRow.version),
      ),
      target: DatabaseSchema.workout.id,
    });
}
