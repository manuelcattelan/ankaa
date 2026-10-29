type GetDatabaseUrlOptions = {
  name: string;
  postgresServerUrl: string;
};

export function getDatabaseUrl({
  name,
  postgresServerUrl,
}: GetDatabaseUrlOptions) {
  const databaseUrl = new URL(postgresServerUrl);

  databaseUrl.pathname = `/${name}`;

  return databaseUrl.href;
}
