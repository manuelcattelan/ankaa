import type { DrizzleDatabase } from "@ankaa/database";
import type { PgInsertValue, PgTable } from "drizzle-orm/pg-core";

type InsertRowsOptions<TTable extends PgTable> = {
  database: DrizzleDatabase;
  rows: PgInsertValue<TTable>[];
  table: TTable;
};

export async function insertRows<TTable extends PgTable>({
  database,
  rows,
  table,
}: InsertRowsOptions<TTable>) {
  if (rows.length === 0) {
    return;
  }

  await database.insert(table).values(rows);
}
