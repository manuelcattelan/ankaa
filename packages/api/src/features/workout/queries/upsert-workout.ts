import type { DrizzleDatabase } from "@ankaa/database";

import * as WorkoutDatabaseSchema from "@ankaa/database/schema/workout";
import { sql } from "drizzle-orm";

type UpsertWorkoutOptions = {
  database: DrizzleDatabase;
  workoutRow: WorkoutRow;
};

type WorkoutRow = typeof WorkoutDatabaseSchema.workout.$inferInsert;

export async function upsertWorkout({
  database,
  workoutRow,
}: UpsertWorkoutOptions) {
  await database
    .insert(WorkoutDatabaseSchema.workout)
    .values(workoutRow)
    .onConflictDoUpdate({
      set: {
        endedAt: workoutRow.endedAt,
        routineId: workoutRow.routineId,
        startedAt: workoutRow.startedAt,
        updatedAt: sql`now()`,
        version: workoutRow.version,
      },
      target: WorkoutDatabaseSchema.workout.id,
    });
}
