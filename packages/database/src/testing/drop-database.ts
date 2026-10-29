import type { Client } from "pg";

import { escapeIdentifier } from "pg";

export async function dropDatabase({
  name,
  postgresClient,
}: {
  name: string;
  postgresClient: Client;
}) {
  await postgresClient.query(
    `DROP DATABASE IF EXISTS ${escapeIdentifier(name)} WITH (FORCE)`,
  );
}
