import childProcess from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it, onTestFinished } from "vitest";

import { createTestDatabase } from "#/testing/create-test-database.ts";
import { dropTestDatabase } from "#/testing/drop-test-database.ts";
import { queryDatabase } from "#/testing/query-database.ts";

const execFile = promisify(childProcess.execFile);

// A test that runs migrate-production.ts twice, each time as a child process,
// takes about 5.3 s on GitHub's runner, past Vitest's default timeout of
// 5000 ms, so it gets a timeout of its own (https://vitest.dev/api/test#timeout).
const TWO_RUN_TEST_TIMEOUT_MILLISECONDS = 30_000;

const migrateProductionPath = fileURLToPath(
  new URL("migrate-production.ts", import.meta.url),
);

async function createEmptyDatabase() {
  const testDatabase = await createTestDatabase();

  onTestFinished(() => dropTestDatabase(testDatabase.name));

  return testDatabase.url;
}

async function query({
  databaseUrl,
  text,
}: {
  databaseUrl: string;
  text: string;
}) {
  return await queryDatabase({
    execute: async (postgresClient) =>
      (await postgresClient.query<Record<string, unknown>>(text)).rows,
    url: databaseUrl,
  });
}

async function runMigrateProduction(databaseUrl: string) {
  await execFile(process.execPath, [migrateProductionPath], {
    env: { DATABASE_URL_DIRECT: databaseUrl },
  });
}

describe("migrate-production", () => {
  it("applies every migration to an empty database, then runs the seed", async () => {
    const databaseUrl = await createEmptyDatabase();

    await runMigrateProduction(databaseUrl);

    await expect(
      query({
        databaseUrl,
        text: "SELECT name FROM drizzle.__drizzle_migrations ORDER BY id",
      }),
    ).resolves.toStrictEqual([
      { name: "20260915060902_create_auth_tables" },
      { name: "20261007135324_create_exercise_tables" },
      { name: "20261008064416_create_routine_tables" },
      { name: "20261008065842_rename_routine_exercise_set_variation_checks" },
      { name: "20261008073249_create_workout_tables" },
      { name: "20261008073942_rename_workout_indexes_and_constraints" },
      { name: "20261009064417_cascade_exercise_child_tables_on_delete" },
      {
        name: "20261029101423_follow_database_conventions_in_exercise_and_authentication_tables",
      },
      {
        name: "20261029101425_reference_authentication_user_from_routine_and_workout",
      },
      { name: "20261029135352_store_routines_as_a_tree" },
      { name: "20261029151447_start_workouts_from_a_copy_of_the_routine" },
      { name: "20261029155503_record_and_remove_sets" },
      { name: "20261029184616_name_constraints_and_check_routine_names" },
      { name: "20261029190628_rename_skip_reason_note_to_skip_note" },
      { name: "20261102160640_label_pyramids" },
      { name: "20261102162314_record_absences" },
      { name: "20261102165148_soft_delete_absences" },
    ]);
    await expect(
      query({ databaseUrl, text: "SELECT id, name FROM exercise" }),
    ).resolves.toStrictEqual([
      {
        id: "01a116a3-0b0f-70ce-91c2-03ac50a49f4b",
        name: "Bench Press (Barbell)",
      },
    ]);
  });

  it(
    "changes neither the migrations nor the Exercises when it runs again",
    { timeout: TWO_RUN_TEST_TIMEOUT_MILLISECONDS },
    async () => {
      const databaseUrl = await createEmptyDatabase();
      await runMigrateProduction(databaseUrl);
      const migrations = await query({
        databaseUrl,
        text: "SELECT * FROM drizzle.__drizzle_migrations ORDER BY id",
      });

      await runMigrateProduction(databaseUrl);

      await expect(
        query({
          databaseUrl,
          text: "SELECT * FROM drizzle.__drizzle_migrations ORDER BY id",
        }),
      ).resolves.toStrictEqual(migrations);
      await expect(
        query({
          databaseUrl,
          text: "SELECT id, name, amount_unit, weight_type FROM exercise",
        }),
      ).resolves.toStrictEqual([
        {
          amount_unit: "repetition",
          id: "01a116a3-0b0f-70ce-91c2-03ac50a49f4b",
          name: "Bench Press (Barbell)",
          weight_type: "total",
        },
      ]);
      await expect(
        query({
          databaseUrl,
          text: "SELECT muscle_group, role FROM exercise_muscle_group ORDER BY muscle_group",
        }),
      ).resolves.toStrictEqual([
        { muscle_group: "chest", role: "primary" },
        { muscle_group: "front_deltoid", role: "secondary" },
        { muscle_group: "triceps", role: "secondary" },
      ]);
      await expect(
        query({
          databaseUrl,
          text: "SELECT equipment FROM exercise_equipment ORDER BY equipment",
        }),
      ).resolves.toStrictEqual([
        { equipment: "barbell" },
        { equipment: "bench" },
        { equipment: "rack" },
      ]);
    },
  );

  it(
    "exits with an error and runs no seed when a migration fails",
    { timeout: TWO_RUN_TEST_TIMEOUT_MILLISECONDS },
    async () => {
      const databaseUrl = await createEmptyDatabase();
      await runMigrateProduction(databaseUrl);
      await query({
        databaseUrl,
        text: "DELETE FROM drizzle.__drizzle_migrations",
      });
      await query({ databaseUrl, text: "DELETE FROM exercise" });

      await expect(runMigrateProduction(databaseUrl)).rejects.toMatchObject({
        code: 1,
      });

      await expect(
        query({ databaseUrl, text: "SELECT id FROM exercise" }),
      ).resolves.toStrictEqual([]);
    },
  );
});
