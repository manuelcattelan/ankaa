import type { Client } from "pg";
import type { TestProject } from "vitest/node";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { escapeIdentifier } from "pg";
import { lock } from "proper-lockfile";

import { dropDatabase } from "#/testing/drop-database.ts";
import { getDatabaseUrl } from "#/testing/get-database-url.ts";
import { queryDatabase } from "#/testing/query-database.ts";
import "#/testing/provided-context.ts";

type BuildTemplateDatabaseOptions = {
  maintenanceClient: Client;
  maintenanceDatabaseUrl: string;
  name: string;
};

const MIGRATIONS_HASH_LENGTH = 16;

const POSTGRES_CONTAINER_IMAGE = "postgres:18.6";

const POSTGRES_CONTAINER_LABELS = { "ankaa.test-database": "true" };

const TEMPLATE_DATABASE_LOCK_KEY = 54_046;

const POSTGRES_CONTAINER_LOCK_RETRY_MAXIMUM_TIMEOUT_MILLISECONDS = 3_000;

const POSTGRES_CONTAINER_LOCK_RETRY_MINIMUM_TIMEOUT_MILLISECONDS = 500;

const POSTGRES_CONTAINER_LOCK_RETRY_OPTIONS = {
  factor: 1,
  forever: true,
  maxTimeout: POSTGRES_CONTAINER_LOCK_RETRY_MAXIMUM_TIMEOUT_MILLISECONDS,
  minTimeout: POSTGRES_CONTAINER_LOCK_RETRY_MINIMUM_TIMEOUT_MILLISECONDS,
  randomize: true,
};

const migrationsFolderPath = fileURLToPath(
  new URL("../../drizzle", import.meta.url),
);

const postgresContainerLockFolderPath = path.join(homedir(), ".cache", "ankaa");

export async function setup(project: TestProject) {
  const postgresContainer = await startPostgresContainer();

  const maintenanceDatabaseUrl = getDatabaseUrl({
    name: "postgres",
    postgresServerUrl: postgresContainer.getConnectionUri(),
  });

  const templateDatabaseName = await createTemplateDatabase(
    maintenanceDatabaseUrl,
  );

  project.provide("postgresMaintenanceDatabaseUrl", maintenanceDatabaseUrl);
  project.provide("postgresTemplateDatabaseName", templateDatabaseName);
}

async function buildTemplateDatabase({
  maintenanceClient,
  maintenanceDatabaseUrl,
  name,
}: BuildTemplateDatabaseOptions) {
  const buildingDatabaseName = `${name}_building`;

  await dropDatabase({
    name: buildingDatabaseName,
    postgresClient: maintenanceClient,
  });

  await maintenanceClient.query(
    `CREATE DATABASE ${escapeIdentifier(buildingDatabaseName)}`,
  );

  await queryDatabase({
    execute: (migrationClient) =>
      migrate(drizzle({ client: migrationClient }), {
        migrationsFolder: migrationsFolderPath,
      }),
    url: getDatabaseUrl({
      name: buildingDatabaseName,
      postgresServerUrl: maintenanceDatabaseUrl,
    }),
  });

  await maintenanceClient.query(
    `ALTER DATABASE ${escapeIdentifier(buildingDatabaseName)} RENAME TO ${escapeIdentifier(name)}`,
  );

  await maintenanceClient.query(
    `ALTER DATABASE ${escapeIdentifier(name)} WITH IS_TEMPLATE true ALLOW_CONNECTIONS false`,
  );
}

async function createTemplateDatabase(maintenanceDatabaseUrl: string) {
  const templateDatabaseName = `ankaa_template_${getMigrationsHash()}`;

  await queryDatabase({
    execute: async (maintenanceClient) => {
      await maintenanceClient.query("SELECT pg_advisory_lock($1)", [
        TEMPLATE_DATABASE_LOCK_KEY,
      ]);

      const templateDatabaseQueryResult = await maintenanceClient.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [templateDatabaseName],
      );

      if (templateDatabaseQueryResult.rows.length === 0) {
        await buildTemplateDatabase({
          maintenanceClient,
          maintenanceDatabaseUrl,
          name: templateDatabaseName,
        });
      }
    },
    url: maintenanceDatabaseUrl,
  });

  return templateDatabaseName;
}

function getMigrationsHash() {
  const migrations = readMigrationFiles({
    migrationsFolder: migrationsFolderPath,
  });

  return createHash("sha256")
    .update(
      migrations
        .map((migration) => `${migration.name}:${migration.hash}`)
        .join("\n"),
    )
    .digest("hex")
    .slice(0, MIGRATIONS_HASH_LENGTH);
}

async function startPostgresContainer() {
  await mkdir(postgresContainerLockFolderPath, { recursive: true });

  const releasePostgresContainerLock = await lock(
    postgresContainerLockFolderPath,
    {
      lockfilePath: path.join(
        postgresContainerLockFolderPath,
        "postgres-test-container.lock",
      ),
      retries: POSTGRES_CONTAINER_LOCK_RETRY_OPTIONS,
    },
  );

  try {
    return await new PostgreSqlContainer(POSTGRES_CONTAINER_IMAGE)
      .withLabels(POSTGRES_CONTAINER_LABELS)
      .withReuse()
      .start();
  } finally {
    await releasePostgresContainerLock();
  }
}
