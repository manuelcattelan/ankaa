import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  primaryKey,
  snakeCase,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "#/columns/timestamps.ts";

export const authenticationSchema = snakeCase.schema("authentication");

export const user = authenticationSchema.table(
  "user",
  {
    ...timestamps,
    email: text().notNull().unique("user_email_key"),
    emailVerified: boolean().notNull().default(false),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    image: text(),
    name: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "user_pkey" })],
);

export const session = authenticationSchema.table(
  "session",
  {
    ...timestamps,
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    ipAddress: text(),
    token: text().notNull().unique("session_token_key"),
    userAgent: text(),
    userId: uuid()
      .notNull()
      .references(() => user.id, {
        name: "session_user_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "session_pkey" }),
    index("session_user_id_idx").on(table.userId),
  ],
);

export const account = authenticationSchema.table(
  "account",
  {
    ...timestamps,
    accessToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    accountId: text().notNull(),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    idToken: text(),
    password: text(),
    providerId: text().notNull(),
    refreshToken: text(),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    userId: uuid()
      .notNull()
      .references(() => user.id, {
        name: "account_user_id_fkey",
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "account_pkey" }),
    index("account_user_id_idx").on(table.userId),
  ],
);

export const verification = authenticationSchema.table(
  "verification",
  {
    ...timestamps,
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    id: uuid()
      .notNull()
      .default(sql`uuidv7()`),
    identifier: text().notNull(),
    value: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "verification_pkey" }),
    index("verification_identifier_idx").on(table.identifier),
  ],
);
