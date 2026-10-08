import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const commonColumns = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
