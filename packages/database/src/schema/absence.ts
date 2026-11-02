import { SKIP_REASONS } from "@ankaa/core/shared/constants/skip-reasons";
import { inArray, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  primaryKey,
  snakeCase,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "#/schema/authentication.ts";
import { routine } from "#/schema/routine.ts";

export const absence = snakeCase.table(
  "absence",
  {
    date: date().notNull(),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    note: text(),
    reason: text({ enum: SKIP_REASONS }).notNull(),
    routineId: uuid()
      .notNull()
      .references(() => routine.id, {
        name: "absence_routine_id_fkey",
        onDelete: "restrict",
      }),
    userId: uuid()
      .notNull()
      .references(() => user.id, {
        name: "absence_user_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "absence_pkey" }),
    unique("absence_routine_id_date_key").on(table.routineId, table.date),
    index("absence_user_id_idx").on(table.userId),
    check("absence_reason_check", inArray(table.reason, SKIP_REASONS)),
  ],
);
