import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

/**
 * The `created_at` and `updated_at` columns of a table whose rows are
 * updated in place, spread into its columns as Drizzle's docs reuse columns
 * (https://orm.drizzle.team/docs/sql-schema-declaration#advanced).
 */
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};
