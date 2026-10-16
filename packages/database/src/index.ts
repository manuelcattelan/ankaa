import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type {
  PgAsyncDatabase,
  PgAsyncTransaction,
} from "drizzle-orm/pg-core/async";

import { urlFilter } from "@ankaa/core/shared/filters/url-filter";
import { defineRelationsPart } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { Pool } from "pg";

import { DatabaseError } from "./error.ts";
import * as DatabaseSchema from "./schema/index.ts";

const relations = {
  ...defineRelationsPart(DatabaseSchema),
  ...DatabaseSchema.authRelations,
  ...DatabaseSchema.exerciseRelations,
  ...DatabaseSchema.routineRelations,
  ...DatabaseSchema.workoutRelations,
};

export type DrizzleDatabase = PgAsyncDatabase<
  NodePgQueryResultHKT,
  DatabaseRelations
>;

type DatabaseRelations = typeof relations;

type DrizzleTransaction = PgAsyncTransaction<
  NodePgQueryResultHKT,
  DatabaseRelations
>;

export class Database extends Context.Service<Database>()(
  "@ankaa/database/Database",
  {
    make: Effect.gen(function* () {
      const databaseUrl = yield* Config.schema(
        Schema.Redacted(Schema.String.check(urlFilter)),
        "DATABASE_URL",
      );

      const pool = yield* Effect.acquireRelease(
        Effect.sync(
          () => new Pool({ connectionString: Redacted.value(databaseUrl) }),
        ),
        closePool,
      );

      const drizzleDatabase = drizzle({ client: pool, relations });

      function query<TQueryResult>(
        execute: (database: DrizzleDatabase) => Promise<TQueryResult>,
      ) {
        return Effect.tryPromise({
          catch: (cause) => new DatabaseError({ cause }),
          try: () => execute(drizzleDatabase),
        });
      }

      function transaction<TTransactionResult>(
        execute: (
          transaction: DrizzleTransaction,
        ) => Promise<TTransactionResult>,
      ) {
        return Effect.tryPromise({
          catch: (cause) => new DatabaseError({ cause }),
          try: () => drizzleDatabase.transaction(execute),
        });
      }

      return { drizzleDatabase, query, transaction };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}

function closePool(pool: Pool) {
  return Effect.promise(() => pool.end());
}
