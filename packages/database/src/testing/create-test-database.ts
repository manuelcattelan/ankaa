import { randomUUID } from "node:crypto";
import { escapeIdentifier } from "pg";
import { inject } from "vitest";

import { getDatabaseUrl } from "#/testing/get-database-url.ts";
import { queryDatabase } from "#/testing/query-database.ts";
import "#/testing/provided-context.ts";

/**
 * Creates a database of its own for a test, as a copy of `templateName` when
 * given and empty otherwise, and returns its name and URL.
 */
export async function createTestDatabase(templateName?: string) {
  const maintenanceDatabaseUrl = inject("postgresMaintenanceDatabaseUrl");
  const name = `ankaa_test_${randomUUID().replaceAll("-", "")}`;
  const templateClause =
    templateName === undefined
      ? ""
      : ` TEMPLATE ${escapeIdentifier(templateName)}`;

  await queryDatabase({
    execute: (postgresClient) =>
      postgresClient.query(
        `CREATE DATABASE ${escapeIdentifier(name)}${templateClause}`,
      ),
    url: maintenanceDatabaseUrl,
  });

  return {
    name,
    url: getDatabaseUrl({ name, postgresServerUrl: maintenanceDatabaseUrl }),
  };
}
