import { Client } from "pg";

export async function queryDatabase<TQueryResult>({
  execute,
  url,
}: {
  execute: (postgresClient: Client) => Promise<TQueryResult>;
  url: string;
}) {
  const postgresClient = new Client({ connectionString: url });

  await postgresClient.connect();

  try {
    return await execute(postgresClient);
  } finally {
    await postgresClient.end();
  }
}
