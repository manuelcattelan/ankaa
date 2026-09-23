import { defineRelationsPart } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { environment } from "./environment.ts";
import * as Schema from "./schema/index.ts";

const relations = defineRelationsPart(Schema);

export const database = drizzle(environment.DATABASE_URL, {
  relations: { ...relations, ...Schema.authRelations },
});
