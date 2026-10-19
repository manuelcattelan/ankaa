import type { TestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";
import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

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

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000001";

const PUSH_UP_EXERCISE_ID = "019a0000-0000-7000-8000-000000000002";

const ROUTINE_EXERCISE_SET: RoutineSaveInput["exercises"][number]["sets"][number] =
  {
    amount: 8,
    dropSetSegmentCount: null,
    dropSetWeightPercentage: null,
    id: "019a0000-0000-7000-8000-000000000301",
    isToFailure: false,
    position: 0,
    restPauseRestSeconds: null,
    restPauseSegmentCount: null,
    restSeconds: 120,
    setType: "working",
    tempo: "3-0-1-2",
    variation: null,
  };

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

  await runtime.runPromise(
    createTestExercise({
      id: PUSH_UP_EXERCISE_ID,
      name: "Push-Up",
      weightType: "bodyweight",
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

describe("routine.list", () => {
  it("fails with UNAUTHORIZED without a session", async () => {
    const caller = createCaller(createInnerContext({ runtime, session: null }));

    await expect(caller.routine.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("returns only the Routines of the signed-in user, ordered by name", async () => {
    const caller = await createSignedInCaller();
    const otherCaller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000011",
      name: "Push",
    });

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000012",
      name: "Pull",
    });

    await otherCaller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000013",
      name: "Legs",
    });

    await expect(caller.routine.list()).resolves.toStrictEqual([
      {
        days: [],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000012",
        name: "Pull",
      },
      {
        days: [],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000011",
        name: "Push",
      },
    ]);
  });
});

describe("routine.save", () => {
  it("fails with UNAUTHORIZED without a session", async () => {
    const caller = createCaller(createInnerContext({ runtime, session: null }));

    await expect(
      caller.routine.save({
        days: [],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000021",
        name: "Push",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("saves a new Routine, which then appears in the routine.list of the user", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: ["thursday", "monday"],
      exercises: [
        {
          exerciseId: BENCH_PRESS_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000000201",
          note: "Pause on the chest",
          position: 0,
          section: "main",
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              amount: 12,
              id: "019a0000-0000-7000-8000-000000000301",
              restSeconds: 60,
              setType: "warm_up",
              tempo: null,
            },
            {
              ...ROUTINE_EXERCISE_SET,
              dropSetSegmentCount: 3,
              dropSetWeightPercentage: 20,
              id: "019a0000-0000-7000-8000-000000000302",
              isToFailure: true,
              position: 1,
              variation: "drop_set",
            },
          ],
          superset: null,
          warmUpForRoutineExerciseId: null,
        },
        {
          exerciseId: PUSH_UP_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000000202",
          note: null,
          position: 1,
          section: "cool_down",
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              amount: 15,
              id: "019a0000-0000-7000-8000-000000000303",
              restSeconds: null,
              tempo: null,
            },
          ],
          superset: null,
          warmUpForRoutineExerciseId: null,
        },
      ],
      id: "019a0000-0000-7000-8000-000000000022",
      name: "Push",
    });

    await expect(caller.routine.list()).resolves.toStrictEqual([
      {
        days: ["monday", "thursday"],
        exercises: [
          {
            exerciseId: BENCH_PRESS_EXERCISE_ID,
            id: "019a0000-0000-7000-8000-000000000201",
            note: "Pause on the chest",
            position: 0,
            section: "main",
            sets: [
              {
                amount: 12,
                dropSetSegmentCount: null,
                dropSetWeightPercentage: null,
                id: "019a0000-0000-7000-8000-000000000301",
                isToFailure: false,
                position: 0,
                restPauseRestSeconds: null,
                restPauseSegmentCount: null,
                restSeconds: 60,
                setType: "warm_up",
                tempo: null,
                variation: null,
              },
              {
                amount: 8,
                dropSetSegmentCount: 3,
                dropSetWeightPercentage: 20,
                id: "019a0000-0000-7000-8000-000000000302",
                isToFailure: true,
                position: 1,
                restPauseRestSeconds: null,
                restPauseSegmentCount: null,
                restSeconds: 120,
                setType: "working",
                tempo: "3-0-1-2",
                variation: "drop_set",
              },
            ],
            superset: null,
            warmUpForRoutineExerciseId: null,
          },
          {
            exerciseId: PUSH_UP_EXERCISE_ID,
            id: "019a0000-0000-7000-8000-000000000202",
            note: null,
            position: 1,
            section: "cool_down",
            sets: [
              {
                amount: 15,
                dropSetSegmentCount: null,
                dropSetWeightPercentage: null,
                id: "019a0000-0000-7000-8000-000000000303",
                isToFailure: false,
                position: 0,
                restPauseRestSeconds: null,
                restPauseSegmentCount: null,
                restSeconds: null,
                setType: "working",
                tempo: null,
                variation: null,
              },
            ],
            superset: null,
            warmUpForRoutineExerciseId: null,
          },
        ],
        id: "019a0000-0000-7000-8000-000000000022",
        name: "Push",
      },
    ]);
  });

  it("updates a Routine of the user, replacing its name, days and Routine exercises in routine.list", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: ["monday"],
      exercises: [
        {
          exerciseId: BENCH_PRESS_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000000203",
          note: null,
          position: 0,
          section: "main",
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              id: "019a0000-0000-7000-8000-000000000304",
            },
          ],
          superset: null,
          warmUpForRoutineExerciseId: null,
        },
      ],
      id: "019a0000-0000-7000-8000-000000000023",
      name: "Upper",
    });

    await caller.routine.save({
      days: ["friday"],
      exercises: [
        {
          exerciseId: PUSH_UP_EXERCISE_ID,
          id: "019a0000-0000-7000-8000-000000000204",
          note: null,
          position: 0,
          section: "main",
          sets: [
            {
              ...ROUTINE_EXERCISE_SET,
              id: "019a0000-0000-7000-8000-000000000305",
            },
          ],
          superset: null,
          warmUpForRoutineExerciseId: null,
        },
      ],
      id: "019a0000-0000-7000-8000-000000000023",
      name: "Upper Body",
    });

    await expect(caller.routine.list()).resolves.toStrictEqual([
      {
        days: ["friday"],
        exercises: [
          {
            exerciseId: PUSH_UP_EXERCISE_ID,
            id: "019a0000-0000-7000-8000-000000000204",
            note: null,
            position: 0,
            section: "main",
            sets: [
              {
                amount: 8,
                dropSetSegmentCount: null,
                dropSetWeightPercentage: null,
                id: "019a0000-0000-7000-8000-000000000305",
                isToFailure: false,
                position: 0,
                restPauseRestSeconds: null,
                restPauseSegmentCount: null,
                restSeconds: 120,
                setType: "working",
                tempo: "3-0-1-2",
                variation: null,
              },
            ],
            superset: null,
            warmUpForRoutineExerciseId: null,
          },
        ],
        id: "019a0000-0000-7000-8000-000000000023",
        name: "Upper Body",
      },
    ]);
  });

  it("updates a Routine of the user that keeps its name, without a conflict with itself", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: ["monday"],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000028",
      name: "Lower",
    });

    await caller.routine.save({
      days: ["tuesday"],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000028",
      name: "Lower",
    });

    await expect(caller.routine.list()).resolves.toStrictEqual([
      {
        days: ["tuesday"],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000028",
        name: "Lower",
      },
    ]);
  });

  it("fails with CONFLICT when another Routine of the user has the same name", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000024",
      name: "Push",
    });

    await expect(
      caller.routine.save({
        days: [],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000025",
        name: "Push",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("fails with NOT_FOUND when the Routine belongs to another person", async () => {
    const caller = await createSignedInCaller();
    const otherCaller = await createSignedInCaller();

    await otherCaller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000026",
      name: "Legs",
    });

    await expect(
      caller.routine.save({
        days: [],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000026",
        name: "Legs",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("fails with NOT_FOUND when the user has deleted the Routine", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000027",
      name: "Legs",
    });

    await caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000027" });

    await expect(
      caller.routine.save({
        days: [],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000027",
        name: "Legs",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("routine.delete", () => {
  it("fails with UNAUTHORIZED without a session", async () => {
    const caller = createCaller(createInnerContext({ runtime, session: null }));

    await expect(
      caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000031" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("deletes a Routine of the user, which then no longer appears in routine.list", async () => {
    const caller = await createSignedInCaller();

    await caller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000032",
      name: "Push",
    });

    await caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000032" });

    await expect(caller.routine.list()).resolves.toStrictEqual([]);
  });

  it("fails with NOT_FOUND for an unknown Routine", async () => {
    const caller = await createSignedInCaller();

    await expect(
      caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000033" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("fails with NOT_FOUND when the Routine belongs to another person", async () => {
    const caller = await createSignedInCaller();
    const otherCaller = await createSignedInCaller();

    await otherCaller.routine.save({
      days: [],
      exercises: [],
      id: "019a0000-0000-7000-8000-000000000034",
      name: "Push",
    });

    await expect(
      caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000034" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
