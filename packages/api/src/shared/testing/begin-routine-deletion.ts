import { routine } from "@ankaa/database/schema/routine";
import { eq, sql } from "drizzle-orm";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { beginTransaction } from "#/shared/testing/begin-transaction.ts";

/**
 * Deletes the Routine with `id` in a transaction that stays open until the
 * returned function runs, so a test can send a request that reads the
 * Routine while the deletion holds its row.
 */
export function beginRoutineDeletion({
  id,
  runtime,
}: {
  id: string;
  runtime: TestRuntime;
}) {
  return beginTransaction({
    runtime,
    write: (database) =>
      database
        .update(routine)
        .set({ deletedAt: sql`now()` })
        .where(eq(routine.id, id)),
  });
}
