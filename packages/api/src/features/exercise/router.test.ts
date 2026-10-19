import type { TestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";

import { Authentication } from "@ankaa/authentication";
import { createTestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";
import { Database } from "@ankaa/database";
import {
  exercise,
  exerciseEquipment,
  exerciseMuscleGroup,
} from "@ankaa/database/schema/exercise";
import { createTestDatabase } from "@ankaa/vitest/create-test-database";
import { createTestRuntime } from "@ankaa/vitest/create-test-runtime";
import { createTestUser } from "@ankaa/vitest/create-test-user";
import { dropTestDatabase } from "@ankaa/vitest/drop-test-database";
import { afterAll, beforeAll, describe, expect, it } from "@effect/vitest";

import { createInnerContext } from "../../trpc/context.ts";
import { createCallerFactory } from "../../trpc/procedures.ts";
import { appRouter } from "../../trpc/router.ts";

const createCaller = createCallerFactory(appRouter);

describe("exercise.list", () => {
  let testDatabaseUrl: string;
  let runtime: ReturnType<typeof createTestRuntime>;
  let testAuthentication: TestAuthentication;

  beforeAll(async () => {
    testDatabaseUrl = await createTestDatabase();
    runtime = createTestRuntime(testDatabaseUrl);
    testAuthentication = await runtime.runPromise(createTestAuthentication());
  });

  afterAll(async () => {
    await runtime.dispose();

    await dropTestDatabase(testDatabaseUrl);
  });

  it("fails with UNAUTHORIZED without a session", async () => {
    const caller = createCaller(createInnerContext({ runtime, session: null }));

    await expect(caller.exercise.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("returns every Exercise with its Equipment and Muscle groups, ordered by name, to a signed-in user", async () => {
    await runtime.runPromise(
      Database.use((database) =>
        database.transaction(async (transaction) => {
          await transaction.insert(exercise).values([
            {
              amountUnit: "repetition",
              id: "019a0000-0000-7000-8000-000000000001",
              name: "Push-Up",
              weightType: "bodyweight",
            },
            {
              amountUnit: "repetition",
              id: "019a0000-0000-7000-8000-000000000002",
              name: "Bench Press (Barbell)",
              weightType: "total",
            },
          ]);

          await transaction.insert(exerciseEquipment).values([
            {
              equipment: "rack",
              exerciseId: "019a0000-0000-7000-8000-000000000002",
            },
            {
              equipment: "barbell",
              exerciseId: "019a0000-0000-7000-8000-000000000002",
            },
            {
              equipment: "bench",
              exerciseId: "019a0000-0000-7000-8000-000000000002",
            },
          ]);

          await transaction.insert(exerciseMuscleGroup).values([
            {
              exerciseId: "019a0000-0000-7000-8000-000000000001",
              muscleGroup: "triceps",
              muscleGroupRole: "secondary",
            },
            {
              exerciseId: "019a0000-0000-7000-8000-000000000001",
              muscleGroup: "chest",
              muscleGroupRole: "primary",
            },
            {
              exerciseId: "019a0000-0000-7000-8000-000000000002",
              muscleGroup: "front_deltoid",
              muscleGroupRole: "secondary",
            },
            {
              exerciseId: "019a0000-0000-7000-8000-000000000002",
              muscleGroup: "chest",
              muscleGroupRole: "primary",
            },
          ]);
        }),
      ),
    );

    const testUser = await createTestUser(testAuthentication);
    const session = await runtime.runPromise(
      Authentication.use((authentication) =>
        authentication.getSession(testUser.headers),
      ),
    );
    const caller = createCaller(createInnerContext({ runtime, session }));

    const exercises = await caller.exercise.list();

    expect(exercises).toStrictEqual([
      {
        amountUnit: "repetition",
        exerciseEquipment: [
          { equipment: "barbell" },
          { equipment: "bench" },
          { equipment: "rack" },
        ],
        exerciseMuscleGroups: [
          { muscleGroup: "chest", muscleGroupRole: "primary" },
          { muscleGroup: "front_deltoid", muscleGroupRole: "secondary" },
        ],
        id: "019a0000-0000-7000-8000-000000000002",
        name: "Bench Press (Barbell)",
        weightType: "total",
      },
      {
        amountUnit: "repetition",
        exerciseEquipment: [],
        exerciseMuscleGroups: [
          { muscleGroup: "chest", muscleGroupRole: "primary" },
          { muscleGroup: "triceps", muscleGroupRole: "secondary" },
        ],
        id: "019a0000-0000-7000-8000-000000000001",
        name: "Push-Up",
        weightType: "bodyweight",
      },
    ]);
  });
});
