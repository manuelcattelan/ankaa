import { Database } from "@ankaa/database/database";
import { absence } from "@ankaa/database/schema/absence";
import { exercise } from "@ankaa/database/schema/exercise";
import { and, eq, isNull } from "drizzle-orm";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { beginRoutineDeletion } from "#/shared/testing/begin-routine-deletion.ts";
import { buildRoutineSaveInput } from "#/shared/testing/build-routine-save-input.ts";
import { createSignedInCaller } from "#/shared/testing/create-signed-in-caller.ts";
import { createTestRuntime } from "#/shared/testing/create-test-runtime.ts";
import { waitForLockWait } from "#/shared/testing/wait-for-lock-wait.ts";

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000001";

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

/**
 * Reads the id of the one Absence of the Routine with `routineId` that the
 * User hasn't removed, which the database generates, since no procedure
 * returns or lists Absences.
 */
async function readAbsenceId({
  routineId,
  runtime,
}: {
  routineId: string;
  runtime: TestRuntime;
}) {
  const absences = await runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      return yield* database
        .select({ id: absence.id })
        .from(absence)
        .where(
          and(eq(absence.routineId, routineId), isNull(absence.deletedAt)),
        );
    }),
  );

  return absences[0]?.id ?? "";
}

/**
 * Reads the Absences of the Routine with `routineId` that the User hasn't
 * removed.
 */
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
        .where(
          and(eq(absence.routineId, routineId), isNull(absence.deletedAt)),
        );
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
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0001",
        name: "Push day",
      }),
    );
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
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0002",
        name: "Push day",
      }),
    );
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
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0003",
        name: "Push day",
      }),
    );

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
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0004",
        name: "Push day",
      }),
    );
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
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0005",
        name: "Push day",
      }),
    );
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

describe("absence.edit", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("changes the Routine, the date, the reason and the note of the User's Absence", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0101",
        name: "Push day",
      }),
    );
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0102",
        name: "Pull day",
      }),
    );
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0101-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0101-0000-7000-8000-000000000001",
      runtime,
    });

    await caller.absence.edit({
      date: "2026-10-02",
      id,
      note: "Sore shoulder",
      reason: "pain",
      routineId: "019a0102-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });

    await expect(
      readAbsences({
        routineId: "019a0101-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([]);
    await expect(
      readAbsences({
        routineId: "019a0102-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-02", note: "Sore shoulder", reason: "pain" },
    ]);
  });

  it("fails with CONFLICT and AbsenceDateConflictError for a Routine and date that already have an Absence, and changes nothing", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0103",
        name: "Push day",
      }),
    );
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0104",
        name: "Pull day",
      }),
    );
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0103-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_energy",
      routineId: "019a0104-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0104-0000-7000-8000-000000000001",
      runtime,
    });

    await expect(
      caller.absence.edit({
        date: "2026-10-01",
        id,
        note: "Sore shoulder",
        reason: "pain",
        routineId: "019a0103-0000-7000-8000-000000000001",
        timeZone: "Europe/Rome",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "AbsenceDateConflictError" },
      code: "CONFLICT",
    });
    await expect(
      readAbsences({
        routineId: "019a0104-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-01", note: null, reason: "low_energy" },
    ]);
  });

  it("fails with UNPROCESSABLE_CONTENT and AbsenceDateInFutureError for the day after today in the time zone sent, and changes nothing", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0105",
        name: "Push day",
      }),
    );
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0105-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0105-0000-7000-8000-000000000001",
      runtime,
    });

    await expect(
      caller.absence.edit({
        date: formatDate({ daysFromToday: 1, timeZone: "Pacific/Pago_Pago" }),
        id,
        note: null,
        reason: "low_on_time",
        routineId: "019a0105-0000-7000-8000-000000000001",
        timeZone: "Pacific/Pago_Pago",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "AbsenceDateInFutureError" },
      code: "UNPROCESSABLE_CONTENT",
    });
    await expect(
      readAbsences({
        routineId: "019a0105-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-01", note: null, reason: "low_on_time" },
    ]);
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for a Routine the User deleted, and changes nothing", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0106",
        name: "Push day",
      }),
    );
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0107",
        name: "Pull day",
      }),
    );
    await caller.routine.delete({ id: "019a0107-0000-7000-8000-000000000001" });
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0106-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0106-0000-7000-8000-000000000001",
      runtime,
    });

    await expect(
      caller.absence.edit({
        date: "2026-10-01",
        id,
        note: null,
        reason: "low_on_time",
        routineId: "019a0107-0000-7000-8000-000000000001",
        timeZone: "Europe/Rome",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(
      readAbsences({
        routineId: "019a0106-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-01", note: null, reason: "low_on_time" },
    ]);
  });

  it("fails with NOT_FOUND and AbsenceNotFoundError for an Absence of another User, and changes nothing", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0108",
        name: "Push day",
      }),
    );
    await otherCaller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0108-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0108-0000-7000-8000-000000000001",
      runtime,
    });
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0109",
        name: "Push day",
      }),
    );

    await expect(
      caller.absence.edit({
        date: "2026-10-02",
        id,
        note: "Sore shoulder",
        reason: "pain",
        routineId: "019a0109-0000-7000-8000-000000000001",
        timeZone: "Europe/Rome",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "AbsenceNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(
      readAbsences({
        routineId: "019a0108-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-01", note: null, reason: "low_on_time" },
    ]);
  });
});

describe("absence.remove", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("removes the User's Absence, so its Routine and date can have an Absence again", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0201",
        name: "Push day",
      }),
    );
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0201-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0201-0000-7000-8000-000000000001",
      runtime,
    });

    await caller.absence.remove({ id });

    await caller.absence.record({
      date: "2026-10-01",
      note: "Sore shoulder",
      reason: "pain",
      routineId: "019a0201-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    await expect(
      readAbsences({
        routineId: "019a0201-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-01", note: "Sore shoulder", reason: "pain" },
    ]);
  });

  it("succeeds and writes nothing for an Absence that's already gone", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0202",
        name: "Push day",
      }),
    );
    await caller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0202-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0202-0000-7000-8000-000000000001",
      runtime,
    });
    await caller.absence.remove({ id });
    await caller.absence.record({
      date: "2026-10-01",
      note: "Sore shoulder",
      reason: "pain",
      routineId: "019a0202-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });

    await caller.absence.remove({ id });

    await expect(
      readAbsences({
        routineId: "019a0202-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-01", note: "Sore shoulder", reason: "pain" },
    ]);
  });

  it("fails with NOT_FOUND and AbsenceNotFoundError for an Absence of another User, and removes nothing", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        idPrefix: "019a0203",
        name: "Push day",
      }),
    );
    await otherCaller.absence.record({
      date: "2026-10-01",
      note: null,
      reason: "low_on_time",
      routineId: "019a0203-0000-7000-8000-000000000001",
      timeZone: "Europe/Rome",
    });
    const id = await readAbsenceId({
      routineId: "019a0203-0000-7000-8000-000000000001",
      runtime,
    });
    const caller = await createSignedInCaller({ runtime });

    await expect(caller.absence.remove({ id })).rejects.toMatchObject({
      cause: { _tag: "AbsenceNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(
      readAbsences({
        routineId: "019a0203-0000-7000-8000-000000000001",
        runtime,
      }),
    ).resolves.toStrictEqual([
      { date: "2026-10-01", note: null, reason: "low_on_time" },
    ]);
  });
});
