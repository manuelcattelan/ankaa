import { Client } from "pg";

type QueryDatabaseOptions<TQueryResult> = {
  databaseUrl: string;
  execute: (postgresClient: Client) => Promise<TQueryResult>;
};

export async function queryDatabase<TQueryResult>({
  databaseUrl,
  execute,
}: QueryDatabaseOptions<TQueryResult>) {
  const postgresClient = new Client({ connectionString: databaseUrl });

  await postgresClient.connect();

  try {
    return await execute(postgresClient);
  } finally {
    await postgresClient.end();
  }
}
