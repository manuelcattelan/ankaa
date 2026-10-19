import { Database } from "@ankaa/database";
import { createTestRuntime } from "@ankaa/vitest/create-test-runtime";
import { afterAll, beforeAll, describe, expect, it } from "@effect/vitest";

import { createCaller } from "../../shared/testing/create-caller.ts";
import { createSignedInCaller } from "../../shared/testing/create-signed-in-caller.ts";
import { createTestExercise } from "../../shared/testing/create-test-exercise.ts";
import { createInnerContext } from "../../trpc/context.ts";

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000021";

const runtime = createTestRuntime();

beforeAll(async () => {
  await runtime.runPromise(
    createTestExercise({
      id: BENCH_PRESS_EXERCISE_ID,
      name: "Bench Press (Barbell)",
    }),
  );
});

afterAll(async () => {
  await runtime.dispose();
});

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

  it("saves a signed-in person's Workout started from their Routine", async () => {
    const caller = await createSignedInCaller(runtime);

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
    const caller = await createSignedInCaller(runtime);

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
    const caller = await createSignedInCaller(runtime);

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
    const routineOwnerCaller = await createSignedInCaller(runtime);
    const caller = await createSignedInCaller(runtime);

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
    const workoutOwnerCaller = await createSignedInCaller(runtime);
    const caller = await createSignedInCaller(runtime);

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
    const caller = await createSignedInCaller(runtime);

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
    const caller = await createSignedInCaller(runtime);

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
    const caller = await createSignedInCaller(runtime);

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

  it("writes the Workout exercises, Sets and Segments of a Workout", async () => {
    const caller = await createSignedInCaller(runtime);

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000901",
      name: "Push Day",
    });

    await caller.workout.save({
      endedAt: null,
      exercises: [
        {
          amountUnit: "repetition",
          exerciseId: BENCH_PRESS_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000000903",
          note: "Pause at the chest",
          position: 0,
          section: "main",
          sets: [
            {
              id: "019a0000-0000-7000-8000-000000000904",
              isToFailure: true,
              position: 0,
              segments: [
                {
                  amount: 8,
                  id: "019a0000-0000-7000-8000-000000000905",
                  position: 0,
                  weightUnit: "kilogram",
                  weightValue: 80,
                },
                {
                  amount: 4,
                  id: "019a0000-0000-7000-8000-000000000906",
                  position: 1,
                  weightUnit: "kilogram",
                  weightValue: 62.5,
                },
              ],
              setType: "working",
              tempo: "3-0-1-2",
              variation: "drop_set",
            },
          ],
          skipReason: null,
          skipReasonNote: null,
          superset: null,
          warmUpForWorkoutExerciseId: null,
          weightType: "total",
        },
      ],
      id: "019a0000-0000-7000-8000-000000000902",
      routineId: "019a0000-0000-7000-8000-000000000901",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await expect(
      findWorkoutExercises("019a0000-0000-7000-8000-000000000902"),
    ).resolves.toStrictEqual([
      {
        amountUnit: "repetition",
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        id: "019a0000-0000-7000-8000-000000000903",
        note: "Pause at the chest",
        position: 0,
        section: "main",
        skipReason: null,
        skipReasonNote: null,
        superset: null,
        warmUpForWorkoutExerciseId: null,
        weightType: "total",
        workoutExerciseSets: [
          {
            id: "019a0000-0000-7000-8000-000000000904",
            isToFailure: true,
            position: 0,
            setType: "working",
            tempo: "3-0-1-2",
            variation: "drop_set",
            workoutExerciseSetSegments: [
              {
                amount: 8,
                id: "019a0000-0000-7000-8000-000000000905",
                position: 0,
                weightUnit: "kilogram",
                weightValue: 80,
              },
              {
                amount: 4,
                id: "019a0000-0000-7000-8000-000000000906",
                position: 1,
                weightUnit: "kilogram",
                weightValue: 62.5,
              },
            ],
          },
        ],
      },
    ]);
  });

  it("replaces the Workout exercises, Sets and Segments of a Workout with those of its newer version", async () => {
    const caller = await createSignedInCaller(runtime);

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000001001",
      name: "Push Day",
    });

    await caller.workout.save({
      endedAt: null,
      exercises: [
        {
          amountUnit: "repetition",
          exerciseId: BENCH_PRESS_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000001003",
          note: null,
          position: 0,
          section: "main",
          sets: [
            {
              id: "019a0000-0000-7000-8000-000000001004",
              isToFailure: false,
              position: 0,
              segments: [
                {
                  amount: 8,
                  id: "019a0000-0000-7000-8000-000000001005",
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
      id: "019a0000-0000-7000-8000-000000001002",
      routineId: "019a0000-0000-7000-8000-000000001001",
      startedAt: "2026-10-19T08:30:00Z",
      version: 1,
    });

    await caller.workout.save({
      endedAt: null,
      exercises: [
        {
          amountUnit: "repetition",
          exerciseId: BENCH_PRESS_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000001003",
          note: null,
          position: 0,
          section: "main",
          sets: [
            {
              id: "019a0000-0000-7000-8000-000000001004",
              isToFailure: false,
              position: 0,
              segments: [
                {
                  amount: 10,
                  id: "019a0000-0000-7000-8000-000000001005",
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
              id: "019a0000-0000-7000-8000-000000001006",
              isToFailure: false,
              position: 1,
              segments: [
                {
                  amount: 8,
                  id: "019a0000-0000-7000-8000-000000001007",
                  position: 0,
                  weightUnit: "kilogram",
                  weightValue: 85,
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
      id: "019a0000-0000-7000-8000-000000001002",
      routineId: "019a0000-0000-7000-8000-000000001001",
      startedAt: "2026-10-19T08:30:00Z",
      version: 2,
    });

    await expect(
      findWorkoutExercises("019a0000-0000-7000-8000-000000001002"),
    ).resolves.toStrictEqual([
      {
        amountUnit: "repetition",
        exerciseId: BENCH_PRESS_EXERCISE_ID,
        id: "019a0000-0000-7000-8000-000000001003",
        note: null,
        position: 0,
        section: "main",
        skipReason: null,
        skipReasonNote: null,
        superset: null,
        warmUpForWorkoutExerciseId: null,
        weightType: "total",
        workoutExerciseSets: [
          {
            id: "019a0000-0000-7000-8000-000000001004",
            isToFailure: false,
            position: 0,
            setType: "working",
            tempo: null,
            variation: null,
            workoutExerciseSetSegments: [
              {
                amount: 10,
                id: "019a0000-0000-7000-8000-000000001005",
                position: 0,
                weightUnit: "kilogram",
                weightValue: 80,
              },
            ],
          },
          {
            id: "019a0000-0000-7000-8000-000000001006",
            isToFailure: false,
            position: 1,
            setType: "working",
            tempo: null,
            variation: null,
            workoutExerciseSetSegments: [
              {
                amount: 8,
                id: "019a0000-0000-7000-8000-000000001007",
                position: 0,
                weightUnit: "kilogram",
                weightValue: 85,
              },
            ],
          },
        ],
      },
    ]);
  });
});

function findWorkoutExercises(workoutId: string) {
  return runtime.runPromise(
    Database.use((database) =>
      database.query((drizzleDatabase) =>
        drizzleDatabase.query.workoutExercise.findMany({
          columns: {
            amountUnit: true,
            exerciseId: true,
            id: true,
            note: true,
            position: true,
            section: true,
            skipReason: true,
            skipReasonNote: true,
            superset: true,
            warmUpForWorkoutExerciseId: true,
            weightType: true,
          },
          orderBy: { position: "asc" },
          where: { workoutId },
          with: {
            workoutExerciseSets: {
              columns: {
                id: true,
                isToFailure: true,
                position: true,
                setType: true,
                tempo: true,
                variation: true,
              },
              orderBy: { position: "asc" },
              with: {
                workoutExerciseSetSegments: {
                  columns: {
                    amount: true,
                    id: true,
                    position: true,
                    weightUnit: true,
                    weightValue: true,
                  },
                  orderBy: { position: "asc" },
                },
              },
            },
          },
        }),
      ),
    ),
  );
}
