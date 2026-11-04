import { inject } from "vitest";

import { dropDatabase } from "#/testing/drop-database.ts";
import { queryDatabase } from "#/testing/query-database.ts";
import "#/testing/provided-context.ts";

export async function dropTestDatabase(name: string) {
  await queryDatabase({
    execute: (postgresClient) => dropDatabase({ name, postgresClient }),
    url: inject("postgresMaintenanceDatabaseUrl"),
  });
}
