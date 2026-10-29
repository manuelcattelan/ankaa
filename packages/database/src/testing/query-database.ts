import { Client } from "pg";

type QueryDatabaseOptions<TQueryResult> = {
  execute: (postgresClient: Client) => Promise<TQueryResult>;
  url: string;
};

export async function queryDatabase<TQueryResult>({
  execute,
  url,
}: QueryDatabaseOptions<TQueryResult>) {
  const postgresClient = new Client({ connectionString: url });

  await postgresClient.connect();

  try {
    return await execute(postgresClient);
  } finally {
    await postgresClient.end();
  }
}
