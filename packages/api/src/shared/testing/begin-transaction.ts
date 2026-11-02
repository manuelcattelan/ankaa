import type * as Context from "effect/Context";

import { Database } from "@ankaa/database/database";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

/**
 * Runs `write` in a transaction that stays open until the returned function
 * commits it, so a test can send a request while the write holds its rows.
 */
export async function beginTransaction({
  runtime,
  write,
}: {
  runtime: TestRuntime;
  write: (
    database: Context.Service.Shape<typeof Database>,
  ) => Effect.Effect<unknown, unknown>;
}) {
  const written = await runtime.runPromise(Deferred.make<boolean>());
  const commitRequested = await runtime.runPromise(Deferred.make<boolean>());
  const fiber = runtime.runFork(
    Effect.gen(function* () {
      const database = yield* Database;

      yield* database.transaction(() =>
        Effect.gen(function* () {
          yield* write(database);
          yield* Deferred.succeed(written, true);
          yield* Deferred.await(commitRequested);
        }),
      );
    }),
  );
  await runtime.runPromise(Deferred.await(written));

  return async () => {
    await runtime.runPromise(Deferred.succeed(commitRequested, true));
    await runtime.runPromise(Fiber.join(fiber));
  };
}
