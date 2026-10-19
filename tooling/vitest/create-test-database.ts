import { randomUUID } from "node:crypto";
import { escapeIdentifier } from "pg";
import { inject } from "vitest";

import { queryMaintenanceDatabase } from "./query-maintenance-database.ts";
import "./provided-context.ts";

export async function createTestDatabase() {
  const testDatabaseName = `ankaa_test_${randomUUID().replaceAll("-", "")}`;

  await queryMaintenanceDatabase(
    `CREATE DATABASE ${escapeIdentifier(testDatabaseName)} TEMPLATE ${escapeIdentifier(inject("postgresTemplateDatabaseName"))}`,
  );

  const testDatabaseUrl = new URL(inject("postgresMaintenanceDatabaseUrl"));

  testDatabaseUrl.pathname = `/${testDatabaseName}`;

  return testDatabaseUrl.href;
}
