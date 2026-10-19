import { Client } from "pg";
import { inject } from "vitest";

import "./provided-context.ts";

export async function queryMaintenanceDatabase(queryText: string) {
  const maintenanceClient = new Client({
    connectionString: inject("postgresMaintenanceDatabaseUrl"),
  });

  await maintenanceClient.connect();

  try {
    await maintenanceClient.query(queryText);
  } finally {
    await maintenanceClient.end();
  }
}
