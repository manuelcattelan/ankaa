import type { Client } from "pg";

import { escapeIdentifier } from "pg";

type DropDatabaseOptions = {
  databaseName: string;
  postgresClient: Client;
};

export async function dropDatabase({
  databaseName,
  postgresClient,
}: DropDatabaseOptions) {
  await postgresClient.query(
    `DROP DATABASE IF EXISTS ${escapeIdentifier(databaseName)} WITH (FORCE)`,
  );
}
