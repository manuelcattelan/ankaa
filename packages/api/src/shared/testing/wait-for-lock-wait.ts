import { Database } from "@ankaa/database/database";
import { sql } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

type LockWaitCountRow = { count: number };

/**
 * Waits until a query of the test database waits for a lock, or gives up
 * after a second, so a test can commit a transaction it holds open once a
 * write is blocked behind it.
 */
export function waitForLockWait(runtime: TestRuntime) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      const rows = yield* database.execute<LockWaitCountRow>(
        sql`select count(*)::int as count from pg_stat_activity where datname = current_database() and wait_event_type = 'Lock'`,
        "objects",
      );

      return rows[0]?.count ?? 0;
    }).pipe(
      Effect.repeat({
        schedule: Schedule.spaced("10 millis"),
        times: 100,
        until: (count) => count > 0,
      }),
    ),
  );
}
