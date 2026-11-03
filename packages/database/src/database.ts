import * as PgClient from "@effect/sql-pg/PgClient";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { relations } from "#/relations.ts";

export class Database extends Context.Service<
  Database,
  PgDrizzle.EffectPgDatabase<typeof relations>
>()("@ankaa/database/Database") {
  static readonly layerNoDeps = Layer.effect(
    Database,
    Effect.gen(function* () {
      const db = yield* PgDrizzle.makeWithDefaults({ relations });

      return Database.of(db);
    }),
  );

  static readonly layer = Database.layerNoDeps.pipe(
    Layer.provide(
      PgClient.layerConfig({ url: Config.Redacted("DATABASE_URL_POOLED") }),
    ),
  );

  /**
   * Connects on the direct URL instead of the pooled one, for migrations and
   * the seed, because Neon's pooler runs in transaction mode, which migration
   * tools may not support
   * ([Neon](https://neon.com/docs/connect/connection-pooling)).
   */
  static readonly layerDirect = Database.layerNoDeps.pipe(
    Layer.provide(
      PgClient.layerConfig({ url: Config.Redacted("DATABASE_URL_DIRECT") }),
    ),
  );
}
