import { Database } from "@ankaa/database/database";
import { absence } from "@ankaa/database/schema/absence";
import { exercise } from "@ankaa/database/schema/exercise";
import { routine } from "@ankaa/database/schema/routine";
import { eq, sql } from "drizzle-orm";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { beginTransaction } from "#/shared/testing/begin-transaction.ts";
import { createSignedInCaller } from "#/shared/testing/create-signed-in-caller.ts";
import { createTestRuntime } from "#/shared/testing/create-test-runtime.ts";
import { waitForLockWait } from "#/shared/testing/wait-for-lock-wait.ts";

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000001";

/**
 * Deletes the Routine with `id` in a transaction that stays open until the
 * returned function runs, so a test can record an Absence while the deletion
 * holds the Routine's row.
 */
function beginRoutineDeletion({
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

/**
 * Formats the calendar date that is `daysFromToday` days after today in
 * `timeZone`, by the clock that the server reads too, so a test records an
 * Absence relative to the day it runs on.
 */
function formatDate({
  daysFromToday,
  timeZone,
}: {
  daysFromToday: number;
  timeZone: string;
}) {
  return DateTime.formatIsoDate(
    DateTime.add(DateTime.makeZonedUnsafe(new Date(), { timeZone }), {
      days: daysFromToday,
    }),
  );
}

/**
 * Builds a Routine of one Bench Press (Barbell) with one Working set, whose
 * ids all start with `idPrefix`.
 */
function buildRoutineSaveInput({ idPrefix }: { idPrefix: string }) {
  return {
    days: [],
    id: `${idPrefix}-0000-7000-8000-000000000001`,
    name: "Push day",
    sections: {
      coolDown: [],
      main: [
        {
          exercises: [
            {
              exerciseId: BENCH_PRESS_EXERCISE_ID,
              id: `${idPrefix}-0000-7000-8000-000000000003`,
              note: null,
              pyramidLabel: null,
              sets: [
                {
                  amount: 8,
                  id: `${idPrefix}-0000-7000-8000-000000000004`,
                  intensityTechnique: null,
                  isToFailure: false,
                  restSeconds: 120,
                  tempo: null,
                  type: "working" as const,
                },
              ],
              warmUpExercises: [],
            },
          ],
          id: `${idPrefix}-0000-7000-8000-000000000002`,
        },
      ],
      warmUp: [],
    },
  };
}

function insertExercises(runtime: TestRuntime) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      yield* database.insert(exercise).values({
        amountUnit: "repetition",
        id: BENCH_PRESS_EXERCISE_ID,
        name: "Bench Press (Barbell)",
        weightType: "total",
      });
    }),
  );
}

function readAbsences({
  routineId,
  runtime,
}: {
  routineId: string;
  runtime: TestRuntime;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      return yield* database
        .select({
          date: absence.date,
          note: absence.note,
          reason: absence.reason,
        })
        .from(absence)
        .where(eq(absence.routineId, routineId));
    }),
  );
}

describe("absence.record", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("records an Absence for the User's Routine today, even when that Routine has a Workout today", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(buildRoutineSaveInput({ idPrefix: "019a0001" }));
    await caller.workout.start({
      id: "019a0001-0000-7000-8000-000000000005",
      routineId: "019a0001-0000-7000-8000-000000000001",
    });
    const today = formatDate({
      daysFromToday: 0,
      timeZone: "Australia/Sydney",
    });

    await caller.absence.record({
      date: today,
      note: "Sore shoulder",
      reason: "pain",
      routineId: "019a0001-0000-7000-8000-000000000001",
      timeZone: "Australia/Sydney",
    });

    await expect(
      readAbsences({
        routineId: "019a0001-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: today, note: "Sore shoulder", reason: "pain" },
    ]);
  });

  it("fails with CONFLICT and AbsenceDateConflictError for a second Absence for the same Routine and date", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(buildRoutineSaveInput({ idPrefix: "019a0002" }));
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0002-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });

    await expect(
      caller.absence.record({
        date: "2026-10-01",
        note: "Sore shoulder",
        reason: "pain",
        routineId: "019a0002-0000-7000-8000-000000000001",
        timeZone: "Europe/Rome",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "AbsenceDateConflictError" },
      code: "CONFLICT",
    });
  });

  it("fails with UNPROCESSABLE_CONTENT and AbsenceDateInFutureError for the day after today in the time zone sent, and records nothing", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(buildRoutineSaveInput({ idPrefix: "019a0003" }));

    await expect(
      caller.absence.record({
        date: formatDate({ daysFromToday: 1, timeZone: "Pacific/Pago_Pago" }),
        note: null,
        reason: "low_energy",
        routineId: "019a0003-0000-7000-8000-000000000001",
        timeZone: "Pacific/Pago_Pago",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "AbsenceDateInFutureError" },
      code: "UNPROCESSABLE_CONTENT",
    });
    await expect(
      readAbsences({
        routineId: "019a0003-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([]);
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for a Routine the User deleted, and records nothing", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(buildRoutineSaveInput({ idPrefix: "019a0004" }));
    await caller.routine.delete({ id: "019a0004-0000-7000-8000-000000000001" });

    await expect(
      caller.absence.record({
        date: "2026-10-01",
        note: null,
        reason: "other",
        routineId: "019a0004-0000-7000-8000-000000000001",
        timeZone: "Europe/Rome",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(
      readAbsences({
        routineId: "019a0004-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([]);
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for an Absence recorded while a deletion of its Routine commits, and records nothing", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(buildRoutineSaveInput({ idPrefix: "019a0005" }));
    const commitRoutineDeletion = await beginRoutineDeletion({
      id: "019a0005-0000-7000-8000-000000000001",
      runtime,
    });

    const absenceRecord = caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "other",
      routineId: "019a0005-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    await waitForLockWait(runtime);
    await commitRoutineDeletion();

    await expect(absenceRecord).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(
      readAbsences({
        routineId: "019a0005-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([]);
  });
});
