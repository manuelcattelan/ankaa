import { Database } from "@ankaa/database/database";
import {
  exercise,
  exerciseEquipment,
  exerciseMuscleGroup,
} from "@ankaa/database/schema/exercise";
import { sql } from "drizzle-orm";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { afterAll, describe, expect, it } from "vitest";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { createCaller } from "#/shared/testing/create-caller.ts";
import { createSignedInCaller } from "#/shared/testing/create-signed-in-caller.ts";
import { createTestRuntime } from "#/shared/testing/create-test-runtime.ts";
import { waitForLockWait } from "#/shared/testing/wait-for-lock-wait.ts";
import { createInnerContext } from "#/trpc/context.ts";

/**
 * Locks the Exercise table in a transaction that stays open until the
 * returned function runs, so a read of the Exercises waits while it holds.
 */
async function lockExerciseTable(runtime: TestRuntime) {
  const tableLocked = await runtime.runPromise(Deferred.make<boolean>());
  const releaseRequested = await runtime.runPromise(Deferred.make<boolean>());
  const fiber = runtime.runFork(
    Effect.gen(function* () {
      const database = yield* Database;

      yield* database.transaction(() =>
        Effect.gen(function* () {
          yield* database.execute(
            sql`lock table ${exercise} in access exclusive mode`,
          );
          yield* Deferred.succeed(tableLocked, true);
          yield* Deferred.await(releaseRequested);
        }),
      );
    }),
  );
  await runtime.runPromise(Deferred.await(tableLocked));

  return async () => {
    await runtime.runPromise(Deferred.succeed(releaseRequested, true));
    await runtime.runPromise(Fiber.join(fiber));
  };
}

describe("exercise.list", () => {
  const runtime = createTestRuntime();

  afterAll(async () => {
    await runtime.dispose();
  });

  it("fails with UNAUTHORIZED without a session", async () => {
    const caller = createCaller(createInnerContext({ runtime, session: null }));

    await expect(caller.exercise.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("fails with CLIENT_CLOSED_REQUEST when the call is interrupted while it runs", async () => {
    const abortController = new AbortController();
    const caller = await createSignedInCaller({
      runtime,
      signal: abortController.signal,
    });

    const releaseExerciseTable = await lockExerciseTable(runtime);
    const exercises = caller.exercise.list();
    await waitForLockWait(runtime);

    abortController.abort();

    await expect(exercises).rejects.toMatchObject({
      code: "CLIENT_CLOSED_REQUEST",
    });
    await releaseExerciseTable();
  });

  it("returns every Exercise with its Equipment and Muscle groups, ordered by name, to a signed-in User", async () => {
    await runtime.runPromise(
      Effect.gen(function* () {
        const database = yield* Database;

        yield* database.transaction((tx) =>
          Effect.gen(function* () {
            yield* tx.insert(exercise).values([
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

            yield* tx.insert(exerciseEquipment).values([
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

            yield* tx.insert(exerciseMuscleGroup).values([
              {
                exerciseId: "019a0000-0000-7000-8000-000000000001",
                muscleGroup: "triceps",
                role: "secondary",
              },
              {
                exerciseId: "019a0000-0000-7000-8000-000000000001",
                muscleGroup: "chest",
                role: "primary",
              },
              {
                exerciseId: "019a0000-0000-7000-8000-000000000002",
                muscleGroup: "front_deltoid",
                role: "secondary",
              },
              {
                exerciseId: "019a0000-0000-7000-8000-000000000002",
                muscleGroup: "chest",
                role: "primary",
              },
            ]);
          }),
        );
      }),
    );

    const caller = await createSignedInCaller({ runtime });

    const exercises = await caller.exercise.list();

    expect(exercises).toStrictEqual([
      {
        amountUnit: "repetition",
        equipment: [
          { equipment: "barbell" },
          { equipment: "bench" },
          { equipment: "rack" },
        ],
        id: "019a0000-0000-7000-8000-000000000002",
        muscleGroups: [
          { muscleGroup: "chest", role: "primary" },
          { muscleGroup: "front_deltoid", role: "secondary" },
        ],
        name: "Bench Press (Barbell)",
        weightType: "total",
      },
      {
        amountUnit: "repetition",
        equipment: [],
        id: "019a0000-0000-7000-8000-000000000001",
        muscleGroups: [
          { muscleGroup: "chest", role: "primary" },
          { muscleGroup: "triceps", role: "secondary" },
        ],
        name: "Push-Up",
        weightType: "bodyweight",
      },
    ]);
  });
});
