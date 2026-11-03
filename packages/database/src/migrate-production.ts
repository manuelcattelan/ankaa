import { migrate } from "drizzle-orm/effect-postgres/migrator";
import * as Effect from "effect/Effect";
import { fileURLToPath } from "node:url";

import { Database } from "#/database.ts";
import { seed } from "#/seed.ts";

const migrationsFolderPath = fileURLToPath(
  new URL("../drizzle", import.meta.url),
);

await Effect.runPromise(
  Effect.gen(function* () {
    const database = yield* Database;

    yield* migrate(database, { migrationsFolder: migrationsFolderPath });
    yield* seed;
  }).pipe(Effect.provide(Database.layerDirect)),
);
