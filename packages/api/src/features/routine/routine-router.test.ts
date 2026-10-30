import { createTestUser } from "@ankaa/authentication/testing/create-test-user";
import { Database } from "@ankaa/database/database";
import { exercise } from "@ankaa/database/schema/exercise";
import { routine } from "@ankaa/database/schema/routine";
import { eq } from "drizzle-orm";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { createSignedInCaller } from "#/shared/testing/create-signed-in-caller.ts";
import { createTestRuntime } from "#/shared/testing/create-test-runtime.ts";
import { waitForLockWait } from "#/shared/testing/wait-for-lock-wait.ts";

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000001";

const PUSH_UP_EXERCISE_ID = "019a0000-0000-7000-8000-000000000002";

const BAND_PULL_APART_EXERCISE_ID = "019a0000-0000-7000-8000-000000000003";

/**
 * Inserts the Routine of another User in a transaction that stays open until
 * the returned function runs, so a test can Save a Routine with the same id
 * while that Routine isn't committed yet.
 */
async function beginRoutineInsert({
  routineRow,
  runtime,
}: {
  routineRow: typeof routine.$inferInsert;
  runtime: TestRuntime;
}) {
  const routineInserted = await runtime.runPromise(Deferred.make<boolean>());
  const commitRequested = await runtime.runPromise(Deferred.make<boolean>());
  const fiber = runtime.runFork(
    Effect.gen(function* () {
      const database = yield* Database;

      yield* database.transaction(() =>
        Effect.gen(function* () {
          yield* database.insert(routine).values(routineRow);
          yield* Deferred.succeed(routineInserted, true);
          yield* Deferred.await(commitRequested);
        }),
      );
    }),
  );
  await runtime.runPromise(Deferred.await(routineInserted));

  return async () => {
    await runtime.runPromise(Deferred.succeed(commitRequested, true));
    await runtime.runPromise(Fiber.join(fiber));
  };
}

function buildRoutineSaveInput({
  exerciseGroupId,
  id,
  name,
  routineExerciseId,
}: {
  exerciseGroupId: string;
  id: string;
  name: string;
  routineExerciseId: string;
}) {
  return {
    days: [],
    id,
    name,
    sections: {
      coolDown: [],
      main: [
        {
          exercises: [
            {
              exerciseId: BENCH_PRESS_EXERCISE_ID,
              id: routineExerciseId,
              note: null,
              sets: [],
              warmUpExercises: [],
            },
          ],
          id: exerciseGroupId,
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

      yield* database.insert(exercise).values([
        {
          amountUnit: "repetition",
          id: BENCH_PRESS_EXERCISE_ID,
          name: "Bench Press (Barbell)",
          weightType: "total",
        },
        {
          amountUnit: "repetition",
          id: PUSH_UP_EXERCISE_ID,
          name: "Push-Up",
          weightType: "bodyweight",
        },
        {
          amountUnit: "repetition",
          id: BAND_PULL_APART_EXERCISE_ID,
          name: "Band Pull-Apart",
          weightType: "none",
        },
      ]);
    }),
  );
}

function insertRoutine({
  routineRow,
  runtime,
}: {
  routineRow: typeof routine.$inferInsert;
  runtime: TestRuntime;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      yield* database.insert(routine).values(routineRow);
    }),
  );
}

function readRoutineDeletedAt({
  id,
  runtime,
}: {
  id: string;
  runtime: TestRuntime;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      const routines = yield* database
        .select({ deletedAt: routine.deletedAt })
        .from(routine)
        .where(eq(routine.id, id));

      return routines[0]?.deletedAt;
    }),
  );
}

describe("routine.list", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("returns a Routine of the User as a tree of Sections, Exercise groups and Routine exercises, each in order", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save({
      days: ["friday", "monday"],
      id: "019a0000-0000-7000-8000-000000000101",
      name: "Push day",
      sections: {
        coolDown: [],
        main: [
          {
            exercises: [
              {
                exerciseId: BENCH_PRESS_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000303",
                note: "Pause at the chest",
                sets: [
                  {
                    amount: 8,
                    id: "019a0000-0000-7000-8000-000000000404",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: 120,
                    tempo: "3-0-1-2",
                    type: "warm_up",
                  },
                  {
                    amount: 8,
                    id: "019a0000-0000-7000-8000-000000000403",
                    intensityTechnique: {
                      _tag: "DropSet",
                      segmentCount: 3,
                      weightPercentage: 20,
                    },
                    isToFailure: false,
                    restSeconds: 120,
                    tempo: null,
                    type: "working",
                  },
                ],
                warmUpExercises: [
                  {
                    exerciseId: BAND_PULL_APART_EXERCISE_ID,
                    id: "019a0000-0000-7000-8000-000000000304",
                    note: null,
                    sets: [
                      {
                        amount: 15,
                        id: "019a0000-0000-7000-8000-000000000405",
                        intensityTechnique: null,
                        isToFailure: false,
                        restSeconds: null,
                        tempo: null,
                        type: "warm_up",
                      },
                    ],
                  },
                ],
              },
              {
                exerciseId: PUSH_UP_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000302",
                note: null,
                sets: [
                  {
                    amount: 6,
                    id: "019a0000-0000-7000-8000-000000000402",
                    intensityTechnique: {
                      _tag: "RestPauseSet",
                      pauseSeconds: 15,
                      segmentCount: 3,
                    },
                    isToFailure: true,
                    restSeconds: null,
                    tempo: null,
                    type: "working",
                  },
                ],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000202",
          },
          {
            exercises: [
              {
                exerciseId: PUSH_UP_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000301",
                note: null,
                sets: [
                  {
                    amount: 10,
                    id: "019a0000-0000-7000-8000-000000000401",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: 60,
                    tempo: null,
                    type: "working",
                  },
                ],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000201",
          },
        ],
        warmUp: [
          {
            exercises: [
              {
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000305",
                note: null,
                sets: [
                  {
                    amount: 20,
                    id: "019a0000-0000-7000-8000-000000000406",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: null,
                    tempo: null,
                    type: "warm_up",
                  },
                ],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000203",
          },
        ],
      },
    });

    const routines = await caller.routine.list();

    expect(routines).toStrictEqual([
      {
        days: ["monday", "friday"],
        id: "019a0000-0000-7000-8000-000000000101",
        name: "Push day",
        sections: {
          coolDown: [],
          main: [
            {
              exercises: [
                {
                  exerciseId: BENCH_PRESS_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000303",
                  note: "Pause at the chest",
                  sets: [
                    {
                      amount: 8,
                      id: "019a0000-0000-7000-8000-000000000404",
                      intensityTechnique: null,
                      isToFailure: false,
                      restSeconds: 120,
                      tempo: "3-0-1-2",
                      type: "warm_up",
                    },
                    {
                      amount: 8,
                      id: "019a0000-0000-7000-8000-000000000403",
                      intensityTechnique: {
                        _tag: "DropSet",
                        segmentCount: 3,
                        weightPercentage: 20,
                      },
                      isToFailure: false,
                      restSeconds: 120,
                      tempo: null,
                      type: "working",
                    },
                  ],
                  warmUpExercises: [
                    {
                      exerciseId: BAND_PULL_APART_EXERCISE_ID,
                      id: "019a0000-0000-7000-8000-000000000304",
                      note: null,
                      sets: [
                        {
                          amount: 15,
                          id: "019a0000-0000-7000-8000-000000000405",
                          intensityTechnique: null,
                          isToFailure: false,
                          restSeconds: null,
                          tempo: null,
                          type: "warm_up",
                        },
                      ],
                    },
                  ],
                },
                {
                  exerciseId: PUSH_UP_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000302",
                  note: null,
                  sets: [
                    {
                      amount: 6,
                      id: "019a0000-0000-7000-8000-000000000402",
                      intensityTechnique: {
                        _tag: "RestPauseSet",
                        pauseSeconds: 15,
                        segmentCount: 3,
                      },
                      isToFailure: true,
                      restSeconds: null,
                      tempo: null,
                      type: "working",
                    },
                  ],
                  warmUpExercises: [],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000202",
            },
            {
              exercises: [
                {
                  exerciseId: PUSH_UP_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000301",
                  note: null,
                  sets: [
                    {
                      amount: 10,
                      id: "019a0000-0000-7000-8000-000000000401",
                      intensityTechnique: null,
                      isToFailure: false,
                      restSeconds: 60,
                      tempo: null,
                      type: "working",
                    },
                  ],
                  warmUpExercises: [],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000201",
            },
          ],
          warmUp: [
            {
              exercises: [
                {
                  exerciseId: BAND_PULL_APART_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000305",
                  note: null,
                  sets: [
                    {
                      amount: 20,
                      id: "019a0000-0000-7000-8000-000000000406",
                      intensityTechnique: null,
                      isToFailure: false,
                      restSeconds: null,
                      tempo: null,
                      type: "warm_up",
                    },
                  ],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000203",
            },
          ],
        },
      },
    ]);
  });

  it("leaves out the Routines of other Users and the Routines the User deleted", async () => {
    const caller = await createSignedInCaller({ runtime });
    const otherCaller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000211",
        id: "019a0000-0000-7000-8000-000000000111",
        name: "Legs",
        routineExerciseId: "019a0000-0000-7000-8000-000000000311",
      }),
    );
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000212",
        id: "019a0000-0000-7000-8000-000000000112",
        name: "Pull day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000312",
      }),
    );
    await caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000112" });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000213",
        id: "019a0000-0000-7000-8000-000000000113",
        name: "Arms",
        routineExerciseId: "019a0000-0000-7000-8000-000000000313",
      }),
    );

    const routines = await caller.routine.list();

    expect(routines).toMatchObject([
      { id: "019a0000-0000-7000-8000-000000000111", name: "Legs" },
    ]);
  });
});

describe("routine.save", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("creates a Routine of the User, which then appears in routine.list as the tree it Saved", async () => {
    const caller = await createSignedInCaller({ runtime });

    await caller.routine.save({
      days: ["thursday", "monday"],
      id: "019a0000-0000-7000-8000-000000000131",
      name: "  Push day  ",
      sections: {
        coolDown: [],
        main: [
          {
            exercises: [
              {
                exerciseId: BENCH_PRESS_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000331",
                note: "Pause at the chest",
                sets: [
                  {
                    amount: 8,
                    id: "019a0000-0000-7000-8000-000000000431",
                    intensityTechnique: {
                      _tag: "DropSet",
                      segmentCount: 3,
                      weightPercentage: 20,
                    },
                    isToFailure: false,
                    restSeconds: 120,
                    tempo: "3-0-1-2",
                    type: "working",
                  },
                ],
                warmUpExercises: [
                  {
                    exerciseId: BAND_PULL_APART_EXERCISE_ID,
                    id: "019a0000-0000-7000-8000-000000000332",
                    note: null,
                    sets: [
                      {
                        amount: 15,
                        id: "019a0000-0000-7000-8000-000000000432",
                        intensityTechnique: null,
                        isToFailure: false,
                        restSeconds: null,
                        tempo: null,
                        type: "warm_up",
                      },
                    ],
                  },
                ],
              },
              {
                exerciseId: PUSH_UP_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000333",
                note: null,
                sets: [
                  {
                    amount: null,
                    id: "019a0000-0000-7000-8000-000000000433",
                    intensityTechnique: {
                      _tag: "RestPauseSet",
                      pauseSeconds: 15,
                      segmentCount: 3,
                    },
                    isToFailure: true,
                    restSeconds: 90,
                    tempo: null,
                    type: "working",
                  },
                ],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000231",
          },
        ],
        warmUp: [
          {
            exercises: [
              {
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000334",
                note: null,
                sets: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000232",
          },
        ],
      },
    });

    await expect(caller.routine.list()).resolves.toStrictEqual([
      {
        days: ["monday", "thursday"],
        id: "019a0000-0000-7000-8000-000000000131",
        name: "Push day",
        sections: {
          coolDown: [],
          main: [
            {
              exercises: [
                {
                  exerciseId: BENCH_PRESS_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000331",
                  note: "Pause at the chest",
                  sets: [
                    {
                      amount: 8,
                      id: "019a0000-0000-7000-8000-000000000431",
                      intensityTechnique: {
                        _tag: "DropSet",
                        segmentCount: 3,
                        weightPercentage: 20,
                      },
                      isToFailure: false,
                      restSeconds: 120,
                      tempo: "3-0-1-2",
                      type: "working",
                    },
                  ],
                  warmUpExercises: [
                    {
                      exerciseId: BAND_PULL_APART_EXERCISE_ID,
                      id: "019a0000-0000-7000-8000-000000000332",
                      note: null,
                      sets: [
                        {
                          amount: 15,
                          id: "019a0000-0000-7000-8000-000000000432",
                          intensityTechnique: null,
                          isToFailure: false,
                          restSeconds: null,
                          tempo: null,
                          type: "warm_up",
                        },
                      ],
                    },
                  ],
                },
                {
                  exerciseId: PUSH_UP_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000333",
                  note: null,
                  sets: [
                    {
                      amount: null,
                      id: "019a0000-0000-7000-8000-000000000433",
                      intensityTechnique: {
                        _tag: "RestPauseSet",
                        pauseSeconds: 15,
                        segmentCount: 3,
                      },
                      isToFailure: true,
                      restSeconds: 90,
                      tempo: null,
                      type: "working",
                    },
                  ],
                  warmUpExercises: [],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000231",
            },
          ],
          warmUp: [
            {
              exercises: [
                {
                  exerciseId: BAND_PULL_APART_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000334",
                  note: null,
                  sets: [],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000232",
            },
          ],
        },
      },
    ]);
  });

  it("updates a Routine of the User, so the children that the edit removes are gone and the children it keeps keep their ids", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save({
      days: ["monday"],
      id: "019a0000-0000-7000-8000-000000000141",
      name: "Push day",
      sections: {
        coolDown: [],
        main: [
          {
            exercises: [
              {
                exerciseId: BENCH_PRESS_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000341",
                note: null,
                sets: [
                  {
                    amount: 8,
                    id: "019a0000-0000-7000-8000-000000000441",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: 120,
                    tempo: null,
                    type: "working",
                  },
                  {
                    amount: 8,
                    id: "019a0000-0000-7000-8000-000000000442",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: 120,
                    tempo: null,
                    type: "working",
                  },
                ],
                warmUpExercises: [],
              },
              {
                exerciseId: PUSH_UP_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000342",
                note: null,
                sets: [],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000241",
          },
        ],
        warmUp: [
          {
            exercises: [
              {
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000343",
                note: null,
                sets: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000242",
          },
        ],
      },
    });

    await caller.routine.save({
      days: ["friday"],
      id: "019a0000-0000-7000-8000-000000000141",
      name: "Upper body",
      sections: {
        coolDown: [
          {
            exercises: [
              {
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000344",
                note: null,
                sets: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000243",
          },
        ],
        main: [
          {
            exercises: [
              {
                exerciseId: BENCH_PRESS_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000341",
                note: "Pause at the chest",
                sets: [
                  {
                    amount: 6,
                    id: "019a0000-0000-7000-8000-000000000441",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: 120,
                    tempo: null,
                    type: "working",
                  },
                ],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000241",
          },
        ],
        warmUp: [],
      },
    });

    await expect(caller.routine.list()).resolves.toStrictEqual([
      {
        days: ["friday"],
        id: "019a0000-0000-7000-8000-000000000141",
        name: "Upper body",
        sections: {
          coolDown: [
            {
              exercises: [
                {
                  exerciseId: BAND_PULL_APART_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000344",
                  note: null,
                  sets: [],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000243",
            },
          ],
          main: [
            {
              exercises: [
                {
                  exerciseId: BENCH_PRESS_EXERCISE_ID,
                  id: "019a0000-0000-7000-8000-000000000341",
                  note: "Pause at the chest",
                  sets: [
                    {
                      amount: 6,
                      id: "019a0000-0000-7000-8000-000000000441",
                      intensityTechnique: null,
                      isToFailure: false,
                      restSeconds: 120,
                      tempo: null,
                      type: "working",
                    },
                  ],
                  warmUpExercises: [],
                },
              ],
              id: "019a0000-0000-7000-8000-000000000241",
            },
          ],
          warmUp: [],
        },
      },
    ]);
  });

  it("updates a Routine of the User that keeps its name", async () => {
    const caller = await createSignedInCaller({ runtime });
    const routineSaveInput = buildRoutineSaveInput({
      exerciseGroupId: "019a0000-0000-7000-8000-000000000251",
      id: "019a0000-0000-7000-8000-000000000151",
      name: "Push day",
      routineExerciseId: "019a0000-0000-7000-8000-000000000351",
    });
    await caller.routine.save(routineSaveInput);

    await caller.routine.save({ ...routineSaveInput, days: ["sunday"] });

    await expect(caller.routine.list()).resolves.toMatchObject([
      { days: ["sunday"], name: "Push day" },
    ]);
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for the id of another User's Routine, even with the name of one of the User's Routines, and leaves it unchanged", async () => {
    const caller = await createSignedInCaller({ runtime });
    const otherTestUser = await createTestUser(runtime);
    const otherCaller = await createSignedInCaller({
      runtime,
      testUser: otherTestUser,
    });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000261",
        id: "019a0000-0000-7000-8000-000000000161",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000361",
      }),
    );
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000262",
        id: "019a0000-0000-7000-8000-000000000162",
        name: "Legs",
        routineExerciseId: "019a0000-0000-7000-8000-000000000362",
      }),
    );

    await expect(
      caller.routine.save(
        buildRoutineSaveInput({
          exerciseGroupId: "019a0000-0000-7000-8000-000000000263",
          id: "019a0000-0000-7000-8000-000000000162",
          name: "Push day",
          routineExerciseId: "019a0000-0000-7000-8000-000000000363",
        }),
      ),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });

    await expect(otherCaller.routine.list()).resolves.toMatchObject([
      {
        id: "019a0000-0000-7000-8000-000000000162",
        name: "Legs",
        sections: {
          main: [{ id: "019a0000-0000-7000-8000-000000000262" }],
        },
      },
    ]);
  });

  it("fails with NOT_FOUND and RoutineNotFoundError when another User's Routine with the same id commits while the Save runs, and leaves that Routine unchanged", async () => {
    const caller = await createSignedInCaller({ runtime });
    const otherTestUser = await createTestUser(runtime);
    const otherCaller = await createSignedInCaller({
      runtime,
      testUser: otherTestUser,
    });
    const commitRoutineInsert = await beginRoutineInsert({
      routineRow: {
        id: "019a0000-0000-7000-8000-000000000165",
        name: "Legs",
        userId: otherTestUser.user.id,
      },
      runtime,
    });

    const routineSave = caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000265",
        id: "019a0000-0000-7000-8000-000000000165",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000365",
      }),
    );
    await waitForLockWait(runtime);
    await commitRoutineInsert();

    await expect(routineSave).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(otherCaller.routine.list()).resolves.toMatchObject([
      {
        id: "019a0000-0000-7000-8000-000000000165",
        name: "Legs",
        sections: { main: [] },
      },
    ]);
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for the id of a Routine the User deleted", async () => {
    const caller = await createSignedInCaller({ runtime });
    const routineSaveInput = buildRoutineSaveInput({
      exerciseGroupId: "019a0000-0000-7000-8000-000000000271",
      id: "019a0000-0000-7000-8000-000000000171",
      name: "Push day",
      routineExerciseId: "019a0000-0000-7000-8000-000000000371",
    });
    await caller.routine.save(routineSaveInput);
    await caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000171" });

    await expect(caller.routine.save(routineSaveInput)).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
  });

  it("fails with CONFLICT and RoutineNameConflictError for a name that another Routine of the User has in another case", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000281",
        id: "019a0000-0000-7000-8000-000000000181",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000381",
      }),
    );

    await expect(
      caller.routine.save(
        buildRoutineSaveInput({
          exerciseGroupId: "019a0000-0000-7000-8000-000000000282",
          id: "019a0000-0000-7000-8000-000000000182",
          name: "push DAY",
          routineExerciseId: "019a0000-0000-7000-8000-000000000382",
        }),
      ),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNameConflictError" },
      code: "CONFLICT",
    });
  });

  it("ends two concurrent Saves of new Routines with the same name with one Save and one RoutineNameConflictError", async () => {
    const caller = await createSignedInCaller({ runtime });

    const results = await Promise.allSettled([
      caller.routine.save(
        buildRoutineSaveInput({
          exerciseGroupId: "019a0000-0000-7000-8000-000000000291",
          id: "019a0000-0000-7000-8000-000000000191",
          name: "Push day",
          routineExerciseId: "019a0000-0000-7000-8000-000000000391",
        }),
      ),
      caller.routine.save(
        buildRoutineSaveInput({
          exerciseGroupId: "019a0000-0000-7000-8000-000000000292",
          id: "019a0000-0000-7000-8000-000000000192",
          name: "Push day",
          routineExerciseId: "019a0000-0000-7000-8000-000000000392",
        }),
      ),
    ]);

    expect(
      results.filter((result) => result.status === "rejected"),
    ).toMatchObject([
      {
        reason: {
          cause: { _tag: "RoutineNameConflictError" },
          code: "CONFLICT",
        },
      },
    ]);
    await expect(caller.routine.list()).resolves.toMatchObject([
      { name: "Push day" },
    ]);
  });
});

describe("routine.delete", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("deletes a Routine of the User, which then leaves routine.list", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000221",
        id: "019a0000-0000-7000-8000-000000000121",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000321",
      }),
    );

    await caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000121" });

    await expect(caller.routine.list()).resolves.toStrictEqual([]);
  });

  it("succeeds without writing when the User deletes a Routine they already deleted", async () => {
    const testUser = await createTestUser(runtime);
    const caller = await createSignedInCaller({ runtime, testUser });
    await insertRoutine({
      routineRow: {
        deletedAt: new Date("2026-10-29T10:00:00.000Z"),
        id: "019a0000-0000-7000-8000-000000000122",
        name: "Push day",
        userId: testUser.user.id,
      },
      runtime,
    });

    await caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000122" });

    await expect(
      readRoutineDeletedAt({
        id: "019a0000-0000-7000-8000-000000000122",
        runtime,
      }),
    ).resolves.toStrictEqual(new Date("2026-10-29T10:00:00.000Z"));
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for a Routine that doesn't exist", async () => {
    const caller = await createSignedInCaller({ runtime });

    await expect(
      caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000123" }),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for a Routine of another User, and leaves it in their list", async () => {
    const caller = await createSignedInCaller({ runtime });
    const otherCaller = await createSignedInCaller({ runtime });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000224",
        id: "019a0000-0000-7000-8000-000000000124",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000324",
      }),
    );

    await expect(
      caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000124" }),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });

    await expect(otherCaller.routine.list()).resolves.toMatchObject([
      { id: "019a0000-0000-7000-8000-000000000124" },
    ]);
  });
});
