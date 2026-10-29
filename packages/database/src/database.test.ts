import { eq } from "drizzle-orm";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { afterAll, describe, expect, it } from "vitest";

import { Database } from "#/database.ts";
import { exercise } from "#/schema/exercise.ts";
import { testDatabaseLayer } from "#/testing/test-database-layer.ts";

const findExerciseIds = Effect.fn("findExerciseIds")(function* (id: string) {
  const database = yield* Database;

  return yield* database
    .select({ id: exercise.id })
    .from(exercise)
    .where(eq(exercise.id, id));
});

describe("Database", () => {
  const runtime = ManagedRuntime.make(
    Database.layer.pipe(Layer.provideMerge(testDatabaseLayer)),
  );

  afterAll(async () => {
    await runtime.dispose();
  });

  it("rolls back the writes of a transaction that fails with a typed error", async () => {
    const exit = await runtime.runPromiseExit(
      Effect.gen(function* () {
        const database = yield* Database;

        yield* database.transaction(() =>
          Effect.gen(function* () {
            yield* database.insert(exercise).values({
              amountUnit: "repetition",
              id: "019a0000-0000-7000-8000-000000000001",
              name: "Push-Up",
              weightType: "bodyweight",
            });

            return yield* Effect.fail("ExerciseRejected");
          }),
        );
      }),
    );

    expect(exit).toStrictEqual(Exit.fail("ExerciseRejected"));

    await expect(
      runtime.runPromise(
        findExerciseIds("019a0000-0000-7000-8000-000000000001"),
      ),
    ).resolves.toStrictEqual([]);
  });

  it("rolls back the writes of a transaction that dies with a defect", async () => {
    const exit = await runtime.runPromiseExit(
      Effect.gen(function* () {
        const database = yield* Database;

        yield* database.transaction(() =>
          Effect.gen(function* () {
            yield* database.insert(exercise).values({
              amountUnit: "repetition",
              id: "019a0000-0000-7000-8000-000000000002",
              name: "Pull-Up",
              weightType: "bodyweight",
            });

            return yield* Effect.die("ExerciseDefect");
          }),
        );
      }),
    );

    expect(exit).toStrictEqual(Exit.die("ExerciseDefect"));

    await expect(
      runtime.runPromise(
        findExerciseIds("019a0000-0000-7000-8000-000000000002"),
      ),
    ).resolves.toStrictEqual([]);
  });

  it("rolls back the writes of a transaction that is interrupted", async () => {
    const exerciseInserted = await runtime.runPromise(Deferred.make<void>());
    const fiber = runtime.runFork(
      Effect.gen(function* () {
        const database = yield* Database;

        yield* database.transaction(() =>
          Effect.gen(function* () {
            yield* database.insert(exercise).values({
              amountUnit: "repetition",
              id: "019a0000-0000-7000-8000-000000000003",
              name: "Dip",
              weightType: "bodyweight",
            });

            yield* Deferred.succeed(exerciseInserted, undefined);

            return yield* Effect.never;
          }),
        );
      }),
    );
    await runtime.runPromise(Deferred.await(exerciseInserted));

    await runtime.runPromise(Fiber.interrupt(fiber));

    await expect(
      runtime.runPromise(
        findExerciseIds("019a0000-0000-7000-8000-000000000003"),
      ),
    ).resolves.toStrictEqual([]);
  });
});
