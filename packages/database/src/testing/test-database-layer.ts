import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { inject } from "vitest";

import { createTestDatabase } from "#/testing/create-test-database.ts";
import { dropTestDatabase } from "#/testing/drop-test-database.ts";
import "#/testing/provided-context.ts";

export const testDatabaseLayer = Layer.unwrap(
  Effect.acquireRelease(
    Effect.promise(() =>
      createTestDatabase(inject("postgresTemplateDatabaseName")),
    ),
    (testDatabase) => Effect.promise(() => dropTestDatabase(testDatabase.name)),
  ).pipe(
    Effect.map((testDatabase) =>
      ConfigProvider.layerAdd(
        ConfigProvider.fromUnknown({ DATABASE_URL_POOLED: testDatabase.url }),
        { asPrimary: true },
      ),
    ),
  ),
);
