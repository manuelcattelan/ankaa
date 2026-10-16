import type { DrizzleDatabase } from "@ankaa/database";

import * as DatabaseSchema from "@ankaa/database/schema";

type InsertWorkoutExerciseSetSegmentsOptions = {
  database: DrizzleDatabase;
  workoutExerciseSetSegmentRows: WorkoutExerciseSetSegmentRow[];
};

type WorkoutExerciseSetSegmentRow =
  typeof DatabaseSchema.workoutExerciseSetSegment.$inferInsert;

export async function insertWorkoutExerciseSetSegments({
  database,
  workoutExerciseSetSegmentRows,
}: InsertWorkoutExerciseSetSegmentsOptions) {
  if (workoutExerciseSetSegmentRows.length === 0) {
    return;
  }

  await database
    .insert(DatabaseSchema.workoutExerciseSetSegment)
    .values(workoutExerciseSetSegmentRows);
}
