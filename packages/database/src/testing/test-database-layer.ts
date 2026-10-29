import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { randomUUID } from "node:crypto";
import { escapeIdentifier } from "pg";
import { inject } from "vitest";

import { dropDatabase } from "#/testing/drop-database.ts";
import { getDatabaseUrl } from "#/testing/get-database-url.ts";
import { queryDatabase } from "#/testing/query-database.ts";
import "#/testing/provided-context.ts";

export const testDatabaseLayer = Layer.unwrap(
  Effect.acquireRelease(
    Effect.promise(createTestDatabase),
    (testDatabaseName) =>
      Effect.promise(() => dropTestDatabase(testDatabaseName)),
  ).pipe(
    Effect.map((testDatabaseName) =>
      ConfigProvider.layerAdd(
        ConfigProvider.fromUnknown({
          DATABASE_URL_POOLED: getDatabaseUrl({
            name: testDatabaseName,
            postgresServerUrl: inject("postgresMaintenanceDatabaseUrl"),
          }),
        }),
        { asPrimary: true },
      ),
    ),
  ),
);

async function createTestDatabase() {
  const testDatabaseName = `ankaa_test_${randomUUID().replaceAll("-", "")}`;

  await queryDatabase({
    execute: (postgresClient) =>
      postgresClient.query(
        `CREATE DATABASE ${escapeIdentifier(testDatabaseName)} TEMPLATE ${escapeIdentifier(inject("postgresTemplateDatabaseName"))}`,
      ),
    url: inject("postgresMaintenanceDatabaseUrl"),
  });

  return testDatabaseName;
}

async function dropTestDatabase(testDatabaseName: string) {
  await queryDatabase({
    execute: (postgresClient) =>
      dropDatabase({ name: testDatabaseName, postgresClient }),
    url: inject("postgresMaintenanceDatabaseUrl"),
  });
}
