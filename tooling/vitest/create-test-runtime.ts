import type { SendEmailOptions } from "@ankaa/email";

import { ExerciseApplicationService } from "@ankaa/api/features/exercise/exercise-application-service";
import { Authentication } from "@ankaa/authentication";
import { Database } from "@ankaa/database";
import { Email } from "@ankaa/email";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { randomUUID } from "node:crypto";
import { escapeIdentifier } from "pg";
import { inject } from "vitest";

import { dropDatabase } from "./drop-database.ts";
import { getDatabaseUrl } from "./get-database-url.ts";
import { queryDatabase } from "./query-database.ts";
import "./provided-context.ts";

export type TestRuntime = ReturnType<typeof createTestRuntime>;

const testDatabaseLayer = Layer.unwrap(
  Effect.acquireRelease(
    Effect.promise(createTestDatabase),
    (testDatabaseName) =>
      Effect.promise(() => dropTestDatabase(testDatabaseName)),
  ).pipe(
    Effect.map((testDatabaseName) =>
      ConfigProvider.layerAdd(
        ConfigProvider.fromUnknown({
          DATABASE_URL_POOLED: getDatabaseUrl({
            databaseName: testDatabaseName,
            postgresServerUrl: inject("postgresMaintenanceDatabaseUrl"),
          }),
        }),
        { asPrimary: true },
      ),
    ),
  ),
);

export function createTestRuntime(sentEmails: SendEmailOptions[] = []) {
  return ManagedRuntime.make(
    Layer.mergeAll(
      Authentication.layerNoDeps.pipe(
        Layer.provideMerge(Email.layerTest(sentEmails)),
      ),
      Database.layer,
      ExerciseApplicationService.layer,
    ).pipe(Layer.provideMerge(testDatabaseLayer)),
  );
}

async function createTestDatabase() {
  const testDatabaseName = `ankaa_test_${randomUUID().replaceAll("-", "")}`;

  await queryDatabase({
    databaseUrl: inject("postgresMaintenanceDatabaseUrl"),
    execute: (postgresClient) =>
      postgresClient.query(
        `CREATE DATABASE ${escapeIdentifier(testDatabaseName)} TEMPLATE ${escapeIdentifier(inject("postgresTemplateDatabaseName"))}`,
      ),
  });

  return testDatabaseName;
}

async function dropTestDatabase(testDatabaseName: string) {
  await queryDatabase({
    databaseUrl: inject("postgresMaintenanceDatabaseUrl"),
    execute: (postgresClient) =>
      dropDatabase({ databaseName: testDatabaseName, postgresClient }),
  });
}
