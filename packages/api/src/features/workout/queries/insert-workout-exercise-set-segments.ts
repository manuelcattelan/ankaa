import type { DrizzleDatabase } from "@ankaa/database";

import * as WorkoutDatabaseSchema from "@ankaa/database/schema/workout";

import { insertRows } from "../../../shared/queries/insert-rows.ts";

type InsertWorkoutExerciseSetSegmentsOptions = {
  database: DrizzleDatabase;
  workoutExerciseSetSegmentRows: WorkoutExerciseSetSegmentRow[];
};

type WorkoutExerciseSetSegmentRow =
  typeof WorkoutDatabaseSchema.workoutExerciseSetSegment.$inferInsert;

export async function insertWorkoutExerciseSetSegments({
  database,
  workoutExerciseSetSegmentRows,
}: InsertWorkoutExerciseSetSegmentsOptions) {
  await insertRows({
    database,
    rows: workoutExerciseSetSegmentRows,
    table: WorkoutDatabaseSchema.workoutExerciseSetSegment,
  });
}
