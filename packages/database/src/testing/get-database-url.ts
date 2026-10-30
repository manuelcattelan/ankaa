export function getDatabaseUrl({
  name,
  postgresServerUrl,
}: {
  name: string;
  postgresServerUrl: string;
}) {
  const databaseUrl = new URL(postgresServerUrl);

  databaseUrl.pathname = `/${name}`;

  return databaseUrl.href;
}
