import type { DrizzleDatabase } from "@ankaa/database";

import * as DatabaseSchema from "@ankaa/database/schema";

type InsertWorkoutExercisesOptions = {
  database: DrizzleDatabase;
  workoutExerciseRows: WorkoutExerciseRow[];
};

type WorkoutExerciseRow = typeof DatabaseSchema.workoutExercise.$inferInsert;

export async function insertWorkoutExercises({
  database,
  workoutExerciseRows,
}: InsertWorkoutExercisesOptions) {
  if (workoutExerciseRows.length === 0) {
    return;
  }

  await database
    .insert(DatabaseSchema.workoutExercise)
    .values(workoutExerciseRows);
}
