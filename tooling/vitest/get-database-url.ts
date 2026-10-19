type GetDatabaseUrlOptions = {
  databaseName: string;
  postgresServerUrl: string;
};

export function getDatabaseUrl({
  databaseName,
  postgresServerUrl,
}: GetDatabaseUrlOptions) {
  const databaseUrl = new URL(postgresServerUrl);

  databaseUrl.pathname = `/${databaseName}`;

  return databaseUrl.href;
}
