import { escapeIdentifier } from "pg";

import { queryMaintenanceDatabase } from "./query-maintenance-database.ts";

export async function dropTestDatabase(testDatabaseUrl: string) {
  const testDatabaseName = new URL(testDatabaseUrl).pathname.slice(1);

  await queryMaintenanceDatabase(
    `DROP DATABASE IF EXISTS ${escapeIdentifier(testDatabaseName)} WITH (FORCE)`,
  );
}
