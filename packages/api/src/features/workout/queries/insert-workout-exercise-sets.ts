import type { DrizzleDatabase } from "@ankaa/database";

import * as DatabaseSchema from "@ankaa/database/schema";

type InsertWorkoutExerciseSetsOptions = {
  database: DrizzleDatabase;
  workoutExerciseSetRows: WorkoutExerciseSetRow[];
};

type WorkoutExerciseSetRow =
  typeof DatabaseSchema.workoutExerciseSet.$inferInsert;

export async function insertWorkoutExerciseSets({
  database,
  workoutExerciseSetRows,
}: InsertWorkoutExerciseSetsOptions) {
  if (workoutExerciseSetRows.length === 0) {
    return;
  }

  await database
    .insert(DatabaseSchema.workoutExerciseSet)
    .values(workoutExerciseSetRows);
}
