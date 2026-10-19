import type { TestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";

import { Authentication } from "@ankaa/authentication";
import { createTestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";
import { createTestDatabase } from "@ankaa/vitest/create-test-database";
import { createTestRuntime } from "@ankaa/vitest/create-test-runtime";
import { createTestUser } from "@ankaa/vitest/create-test-user";
import { dropTestDatabase } from "@ankaa/vitest/drop-test-database";
import { afterAll, beforeAll, describe, expect, it } from "@effect/vitest";

import { createTestExercise } from "../../shared/testing/create-test-exercise.ts";
import { createInnerContext } from "../../trpc/context.ts";
import { createCallerFactory } from "../../trpc/procedures.ts";
import { appRouter } from "../../trpc/router.ts";

const createCaller = createCallerFactory(appRouter);

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000021";

let testDatabaseUrl: string;
let runtime: ReturnType<typeof createTestRuntime>;
let testAuthentication: TestAuthentication;

beforeAll(async () => {
  testDatabaseUrl = await createTestDatabase();
  runtime = createTestRuntime(testDatabaseUrl);
  testAuthentication = await runtime.runPromise(createTestAuthentication());

  await runtime.runPromise(
    createTestExercise({
      id: BENCH_PRESS_EXERCISE_ID,
      name: "Bench Press (Barbell)",
    }),
  );
});

afterAll(async () => {
  await runtime.dispose();

  await dropTestDatabase(testDatabaseUrl);
});

async function createSignedInCaller() {
  const testUser = await createTestUser(testAuthentication);
  const session = await runtime.runPromise(
    Authentication.use((authentication) =>
      authentication.getSession(testUser.headers),
    ),
  );

  return createCaller(createInnerContext({ runtime, session }));
}

describe("workout.save", () => {
  it("fails with UNAUTHORIZED without a session", async () => {
    const caller = createCaller(createInnerContext({ runtime, session: null }));

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000002",
        routineId: "019a0000-0000-7000-8000-000000000001",
        startedAt: "2026-10-19T08:30:00Z",
        version: 1,
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("saves a signed-in user's Workout started from their Routine", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000101",
      name: "Push Day",
    });

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [
          {
            amountUnit: "repetition",
            exerciseId: BENCH_PRESS_EXERCISE_ID,
            id: "019a0000-0000-7000-8000-000000000103",
            note: "Pause at the chest",
            position: 0,
            section: "main",
            sets: [
              {
                id: "019a0000-0000-7000-8000-000000000104",
                isToFailure: false,
                position: 0,
                segments: [
                  {
                    amount: 8,
                    id: "019a0000-0000-7000-8000-000000000105",
                    position: 0,
                    weightUnit: "kilogram",
                    weightValue: 80,
                  },
                ],
                setType: "working",
                tempo: "3-0-1-2",
                variation: null,
              },
            ],
            skipReason: null,
            skipReasonNote: null,
            superset: null,
            warmUpForWorkoutExerciseId: null,
            weightType: "total",
          },
        ],
        id: "019a0000-0000-7000-8000-000000000102",
        routineId: "019a0000-0000-7000-8000-000000000101",
        startedAt: "2026-10-19T08:30:00Z",
        version: 1,
      }),
    ).resolves.toBeUndefined();
  });

  it("fails with CONFLICT for a second Workout in progress", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000201",
      name: "Push Day",
    });

    await caller.workout.save({
      endedAt: null,
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000202",
      routineId: "019a0000-0000-7000-8000-000000000201",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000203",
        routineId: "019a0000-0000-7000-8000-000000000201",
        startedAt: "2026-10-19T09:30:00Z",
        version: 1,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("fails with NOT_FOUND for a Routine that doesn't exist", async () => {
    const caller = await createSignedInCaller();

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000302",
        routineId: "019a0000-0000-7000-8000-000000000301",
        startedAt: "2026-10-19T08:30:00Z",
        version: 1,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("fails with NOT_FOUND for another person's Routine", async () => {
    const routineOwnerCaller = await createSignedInCaller();
    const caller = await createSignedInCaller();

    await routineOwnerCaller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000401",
      name: "Push Day",
    });

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000402",
        routineId: "019a0000-0000-7000-8000-000000000401",
        startedAt: "2026-10-19T08:30:00Z",
        version: 1,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("fails with NOT_FOUND for another person's Workout", async () => {
    const workoutOwnerCaller = await createSignedInCaller();
    const caller = await createSignedInCaller();

    await workoutOwnerCaller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000501",
      name: "Push Day",
    });

    await workoutOwnerCaller.workout.save({
      endedAt: null,
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000503",
      routineId: "019a0000-0000-7000-8000-000000000501",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000502",
      name: "Push Day",
    });

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000503",
        routineId: "019a0000-0000-7000-8000-000000000502",
        startedAt: "2026-10-19T08:30:00Z",
        version: 2,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("succeeds when the same version of a Workout is saved again", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000601",
      name: "Push Day",
    });

    await caller.workout.save({
      endedAt: null,
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000602",
      routineId: "019a0000-0000-7000-8000-000000000601",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000602",
        routineId: "019a0000-0000-7000-8000-000000000601",
        startedAt: "2026-10-19T08:30:00Z",
        version: 1,
      }),
    ).resolves.toBeUndefined();
  });

  it("doesn't write a version of a Workout that was already saved", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000701",
      name: "Push Day",
    });

    await caller.workout.save({
      endedAt: null,
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000702",
      routineId: "019a0000-0000-7000-8000-000000000701",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await caller.workout.save({
      endedAt: "2026-10-19T09:30:00Z",
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000702",
      routineId: "019a0000-0000-7000-8000-000000000701",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000703",
        routineId: "019a0000-0000-7000-8000-000000000701",
        startedAt: "2026-10-19T10:30:00Z",
        version: 1,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("writes a newer version of a Workout", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000801",
      name: "Push Day",
    });

    await caller.workout.save({
      endedAt: null,
      exercises: [
        {
          amountUnit: "repetition",
          exerciseId: BENCH_PRESS_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000000803",
          note: null,
          position: 0,
          section: "main",
          sets: [
            {
              id: "019a0000-0000-7000-8000-000000000804",
              isToFailure: false,
              position: 0,
              segments: [
                {
                  amount: 8,
                  id: "019a0000-0000-7000-8000-000000000805",
                  position: 0,
                  weightUnit: "kilogram",
                  weightValue: 80,
                },
              ],
              setType: "working",
              tempo: null,
              variation: null,
            },
          ],
          skipReason: null,
          skipReasonNote: null,
          superset: null,
          warmUpForWorkoutExerciseId: null,
          weightType: "total",
        },
      ],
      id: "019a0000-0000-7000-8000-000000000802",
      routineId: "019a0000-0000-7000-8000-000000000801",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await caller.workout.save({
      endedAt: "2026-10-19T09:30:00Z",
      exercises: [
        {
          amountUnit: "repetition",
          exerciseId: BENCH_PRESS_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000000803",
          note: null,
          position: 0,
          section: "main",
          sets: [
            {
              id: "019a0000-0000-7000-8000-000000000804",
              isToFailure: false,
              position: 0,
              segments: [
                {
                  amount: 8,
                  id: "019a0000-0000-7000-8000-000000000805",
                  position: 0,
                  weightUnit: "kilogram",
                  weightValue: 80,
                },
              ],
              setType: "working",
              tempo: null,
              variation: null,
            },
            {
              id: "019a0000-0000-7000-8000-000000000806",
              isToFailure: true,
              position: 1,
              segments: [
                {
                  amount: 6,
                  id: "019a0000-0000-7000-8000-000000000807",
                  position: 0,
                  weightUnit: "kilogram",
                  weightValue: 80,
                },
              ],
              setType: "working",
              tempo: null,
              variation: null,
            },
          ],
          skipReason: null,
          skipReasonNote: null,
          superset: null,
          warmUpForWorkoutExerciseId: null,
          weightType: "total",
        },
      ],
      id: "019a0000-0000-7000-8000-000000000802",
      routineId: "019a0000-0000-7000-8000-000000000801",
      startedAt: "2026-10-19T08:30:00Z",
      version: 2,
    });

    await expect(
      caller.workout.save({
        endedAt: null,
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000808",
        routineId: "019a0000-0000-7000-8000-000000000801",
        startedAt: "2026-10-19T10:30:00Z",
        version: 1,
      }),
    ).resolves.toBeUndefined();
  });
});
