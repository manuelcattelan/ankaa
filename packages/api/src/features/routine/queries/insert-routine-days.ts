import type { DrizzleDatabase } from "@ankaa/database";

import * as RoutineDatabaseSchema from "@ankaa/database/schema/routine";

import { insertRows } from "../../../shared/queries/insert-rows.ts";

type InsertRoutineDaysOptions = {
  database: DrizzleDatabase;
  routineDayRows: RoutineDayRow[];
};

type RoutineDayRow = typeof RoutineDatabaseSchema.routineDay.$inferInsert;

export async function insertRoutineDays({
  database,
  routineDayRows,
}: InsertRoutineDaysOptions) {
  await insertRows({
    database,
    rows: routineDayRows,
    table: RoutineDatabaseSchema.routineDay,
  });
}
