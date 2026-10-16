import type { DrizzleDatabase } from "@ankaa/database";

import * as DatabaseSchema from "@ankaa/database/schema";

type InsertRoutineDaysOptions = {
  database: DrizzleDatabase;
  routineDayRows: RoutineDayRow[];
};

type RoutineDayRow = typeof DatabaseSchema.routineDay.$inferInsert;

export async function insertRoutineDays({
  database,
  routineDayRows,
}: InsertRoutineDaysOptions) {
  if (routineDayRows.length === 0) {
    return;
  }

  await database.insert(DatabaseSchema.routineDay).values(routineDayRows);
}
