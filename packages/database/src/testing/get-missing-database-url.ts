import { inject } from "vitest";

import { getDatabaseUrl } from "#/testing/get-database-url.ts";
import "#/testing/provided-context.ts";

const MISSING_DATABASE_NAME = "ankaa_missing";

/**
 * Returns the URL of a database that doesn't exist on the test Postgres
 * server, so a client that connects to it fails at its first query. It calls
 * this package's own `inject`, because the `ProvidedContext` keys that
 * `provided-context.ts` declares reach only the vitest copy this package
 * resolves, and pnpm installs another copy for some workspaces.
 */
export function getMissingDatabaseUrl() {
  return getDatabaseUrl({
    name: MISSING_DATABASE_NAME,
    postgresServerUrl: inject("postgresMaintenanceDatabaseUrl"),
  });
}
