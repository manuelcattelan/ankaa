import type { Client } from "pg";

import { escapeIdentifier } from "pg";

type DropDatabaseOptions = {
  name: string;
  postgresClient: Client;
};

export async function dropDatabase({
  name,
  postgresClient,
}: DropDatabaseOptions) {
  await postgresClient.query(
    `DROP DATABASE IF EXISTS ${escapeIdentifier(name)} WITH (FORCE)`,
  );
}
