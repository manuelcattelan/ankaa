import { defineRelationsPart } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "./env.ts";
import * as schema from "./schema/index.ts";

const relations = defineRelationsPart(schema);

export const db = drizzle(env.DATABASE_URL, {
  relations: { ...relations, ...schema.authRelations },
});
