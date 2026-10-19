import type { Client } from "pg";
import type { TestProject } from "vitest/node";

import { migrationsFolderPath } from "@ankaa/database/migrations-folder-path";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { escapeIdentifier } from "pg";
import { lock } from "proper-lockfile";

import { dropDatabase } from "./drop-database.ts";
import { getDatabaseUrl } from "./get-database-url.ts";
import { queryDatabase } from "./query-database.ts";
import "./provided-context.ts";

type BuildTemplateDatabaseOptions = {
  maintenanceClient: Client;
  maintenanceDatabaseUrl: string;
  templateDatabaseName: string;
};

const MIGRATIONS_HASH_LENGTH = 16;

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

const postgresContainerLockFolderPath = path.join(homedir(), ".cache", "ankaa");

export async function setup(project: TestProject) {
  const postgresContainer = await startPostgresContainer();

  const maintenanceDatabaseUrl = getDatabaseUrl({
    databaseName: "postgres",
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
  templateDatabaseName,
}: BuildTemplateDatabaseOptions) {
  const buildingDatabaseName = `${templateDatabaseName}_building`;

  await dropDatabase({
    databaseName: buildingDatabaseName,
    postgresClient: maintenanceClient,
  });

  await maintenanceClient.query(
    `CREATE DATABASE ${escapeIdentifier(buildingDatabaseName)}`,
  );

  await queryDatabase({
    databaseUrl: getDatabaseUrl({
      databaseName: buildingDatabaseName,
      postgresServerUrl: maintenanceDatabaseUrl,
    }),
    execute: (migrationClient) =>
      migrate(drizzle({ client: migrationClient }), {
        migrationsFolder: migrationsFolderPath,
      }),
  });

  await maintenanceClient.query(
    `ALTER DATABASE ${escapeIdentifier(buildingDatabaseName)} RENAME TO ${escapeIdentifier(templateDatabaseName)}`,
  );

  await maintenanceClient.query(
    `ALTER DATABASE ${escapeIdentifier(templateDatabaseName)} WITH IS_TEMPLATE true ALLOW_CONNECTIONS false`,
  );
}

async function createTemplateDatabase(maintenanceDatabaseUrl: string) {
  const templateDatabaseName = `ankaa_template_${getMigrationsHash()}`;

  await queryDatabase({
    databaseUrl: maintenanceDatabaseUrl,
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
          templateDatabaseName,
        });
      }
    },
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
    return await new PostgreSqlContainer("postgres:18").withReuse().start();
  } finally {
    await releasePostgresContainerLock();
  }
}
