import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type {
  PgAsyncDatabase,
  PgAsyncTransaction,
} from "drizzle-orm/pg-core/async";

import { urlSchema } from "@ankaa/core/shared/schemas/url-schema";
import { defineRelationsPart } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { Pool } from "pg";

import { DatabaseError } from "./error.ts";
import * as AuthenticationDatabaseSchema from "./schema/authentication.ts";
import * as ExerciseDatabaseSchema from "./schema/exercise.ts";
import * as RoutineDatabaseSchema from "./schema/routine.ts";
import * as WorkoutDatabaseSchema from "./schema/workout.ts";

const relations = {
  ...defineRelationsPart({
    ...AuthenticationDatabaseSchema,
    ...ExerciseDatabaseSchema,
    ...RoutineDatabaseSchema,
    ...WorkoutDatabaseSchema,
  }),
  ...AuthenticationDatabaseSchema.authRelations,
  ...ExerciseDatabaseSchema.exerciseRelations,
  ...RoutineDatabaseSchema.routineRelations,
  ...WorkoutDatabaseSchema.workoutRelations,
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
      const databaseUrl = yield* Config.schema(urlSchema, "DATABASE_URL").pipe(
        Config.map(Redacted.make),
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
        return query((database) => database.transaction(execute));
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
