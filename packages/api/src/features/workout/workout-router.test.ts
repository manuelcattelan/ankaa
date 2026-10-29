import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { Database } from "@ankaa/database/database";
import { exercise } from "@ankaa/database/schema/exercise";
import {
  workout,
  workoutExerciseRecordedSetSegment,
} from "@ankaa/database/schema/workout";
import { eq, sql } from "drizzle-orm";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { createSignedInCaller } from "#/shared/testing/create-signed-in-caller.ts";
import { createTestRuntime } from "#/shared/testing/create-test-runtime.ts";
import { waitForLockWait } from "#/shared/testing/wait-for-lock-wait.ts";

type DatabaseTimeRow = { milliseconds: number };

const generatedId: unknown = expect.any(String);

const serverTime: unknown = expect.any(Date);

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000001";

const PLANK_EXERCISE_ID = "019a0000-0000-7000-8000-000000000002";

const BAND_PULL_APART_EXERCISE_ID = "019a0000-0000-7000-8000-000000000003";

/**
 * Stops the Workout with `id` in a transaction that stays open until the
 * returned function runs, so a test can send a write while the stop holds
 * the Workout's row.
 */
async function beginWorkoutStop({
  id,
  runtime,
}: {
  id: string;
  runtime: TestRuntime;
}) {
  const workoutStopped = await runtime.runPromise(Deferred.make<boolean>());
  const commitRequested = await runtime.runPromise(Deferred.make<boolean>());
  const fiber = runtime.runFork(
    Effect.gen(function* () {
      const database = yield* Database;

      yield* database.transaction(() =>
        Effect.gen(function* () {
          yield* database
            .update(workout)
            .set({ endedAt: sql`now()` })
            .where(eq(workout.id, id));
          yield* Deferred.succeed(workoutStopped, true);
          yield* Deferred.await(commitRequested);
        }),
      );
    }),
  );
  await runtime.runPromise(Deferred.await(workoutStopped));

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
  sets = [],
}: {
  exerciseGroupId: string;
  id: string;
  name: string;
  routineExerciseId: string;
  sets?: RoutineSaveInput["sections"]["main"][number]["exercises"][number]["sets"];
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
              sets,
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
          amountUnit: "second",
          id: PLANK_EXERCISE_ID,
          name: "Plank",
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

/**
 * Reads the current time, in whole milliseconds as a Date holds it, from the
 * database's clock, which stamps every time a Workout records.
 */
function readDatabaseTime(runtime: TestRuntime) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      const rows = yield* database.execute<DatabaseTimeRow>(
        sql`select floor(extract(epoch from now()) * 1000)::float8 as milliseconds`,
        "objects",
      );

      return rows[0]?.milliseconds ?? 0;
    }),
  );
}

function readSegmentCount({
  recordedSetId,
  runtime,
}: {
  recordedSetId: string;
  runtime: TestRuntime;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      const segments = yield* database
        .select({ position: workoutExerciseRecordedSetSegment.position })
        .from(workoutExerciseRecordedSetSegment)
        .where(
          eq(
            workoutExerciseRecordedSetSegment.workoutExerciseRecordedSetId,
            recordedSetId,
          ),
        );

      return segments.length;
    }),
  );
}

function readWorkoutEndedAt({
  id,
  runtime,
}: {
  id: string;
  runtime: TestRuntime;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      const workouts = yield* database
        .select({ endedAt: workout.endedAt })
        .from(workout)
        .where(eq(workout.id, id));

      return workouts[0]?.endedAt;
    }),
  );
}

/**
 * Stops the Workout with `id` at `endedAt`, a time the database's clock
 * never gives, so a test can tell that a later stop left it as it was.
 */
function stopWorkoutAt({
  endedAt,
  id,
  runtime,
}: {
  endedAt: Date;
  id: string;
  runtime: TestRuntime;
}) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const database = yield* Database;

      yield* database
        .update(workout)
        .set({ endedAt })
        .where(eq(workout.id, id));
    }),
  );
}

/**
 * Starts a Workout from a new Routine of one Bench Press (Barbell) with
 * `plannedSets`, whose ids all start with `idPrefix`, and returns the id of
 * its Workout exercise.
 */
async function startBenchPressWorkout({
  caller,
  idPrefix,
  plannedSets,
}: {
  caller: Awaited<ReturnType<typeof createSignedInCaller>>;
  idPrefix: string;
  plannedSets: Omit<
    RoutineSaveInput["sections"]["main"][number]["exercises"][number]["sets"][number],
    "id"
  >[];
}) {
  await caller.routine.save(
    buildRoutineSaveInput({
      exerciseGroupId: `${idPrefix}-0000-7000-8000-000000000002`,
      id: `${idPrefix}-0000-7000-8000-000000000001`,
      name: "Push day",
      routineExerciseId: `${idPrefix}-0000-7000-8000-000000000003`,
      sets: plannedSets.map((plannedSet, position) => ({
        ...plannedSet,
        id: `${idPrefix}-0000-7000-8000-00000000001${String(position)}`,
      })),
    }),
  );
  await caller.workout.start({
    id: `${idPrefix}-0000-7000-8000-000000000004`,
    routineId: `${idPrefix}-0000-7000-8000-000000000001`,
  });
  const workoutInProgress = await caller.workout.findInProgress();

  return workoutInProgress?.sections.main[0]?.exercises[0]?.id ?? "";
}

describe("workout.start", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("builds a Workout with a copy of the Routine's plan, which workout.findInProgress returns as a tree", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save({
      days: ["monday"],
      id: "019a0000-0000-7000-8000-000000000101",
      name: "Push day",
      sections: {
        coolDown: [
          {
            exercises: [
              {
                exerciseId: PLANK_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000301",
                note: null,
                sets: [
                  {
                    amount: 60,
                    id: "019a0000-0000-7000-8000-000000000401",
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: null,
                    tempo: null,
                    type: "working",
                  },
                ],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000201",
          },
        ],
        main: [
          {
            exercises: [
              {
                exerciseId: BENCH_PRESS_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000302",
                note: "Pause at the chest",
                sets: [
                  {
                    amount: 8,
                    id: "019a0000-0000-7000-8000-000000000402",
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
                  {
                    amount: null,
                    id: "019a0000-0000-7000-8000-000000000403",
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
                warmUpExercises: [
                  {
                    exerciseId: BAND_PULL_APART_EXERCISE_ID,
                    id: "019a0000-0000-7000-8000-000000000303",
                    note: null,
                    sets: [
                      {
                        amount: 15,
                        id: "019a0000-0000-7000-8000-000000000404",
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
                exerciseId: PLANK_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000304",
                note: null,
                sets: [],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000202",
          },
        ],
        warmUp: [
          {
            exercises: [
              {
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000305",
                note: "Slowly",
                sets: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000203",
          },
        ],
      },
    });

    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000501",
      routineId: "019a0000-0000-7000-8000-000000000101",
    });

    await expect(caller.workout.findInProgress()).resolves.toStrictEqual({
      id: "019a0000-0000-7000-8000-000000000501",
      sections: {
        coolDown: [
          {
            exercises: [
              {
                amountUnit: "second",
                exerciseId: PLANK_EXERCISE_ID,
                id: generatedId,
                note: null,
                plannedNote: null,
                plannedSets: [
                  {
                    amount: 60,
                    id: generatedId,
                    intensityTechnique: null,
                    isToFailure: false,
                    restSeconds: null,
                    tempo: null,
                    type: "working",
                  },
                ],
                recordedSets: [],
                skipReason: null,
                skipReasonNote: null,
                weightType: "bodyweight",
                weightUnit: "kilogram",
              },
            ],
            id: generatedId,
          },
        ],
        main: [
          {
            exercises: [
              {
                amountUnit: "repetition",
                exerciseId: BENCH_PRESS_EXERCISE_ID,
                id: generatedId,
                note: null,
                plannedNote: "Pause at the chest",
                plannedSets: [
                  {
                    amount: 8,
                    id: generatedId,
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
                  {
                    amount: null,
                    id: generatedId,
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
                recordedSets: [],
                skipReason: null,
                skipReasonNote: null,
                warmUpExercises: [
                  {
                    amountUnit: "repetition",
                    exerciseId: BAND_PULL_APART_EXERCISE_ID,
                    id: generatedId,
                    note: null,
                    plannedNote: null,
                    plannedSets: [
                      {
                        amount: 15,
                        id: generatedId,
                        intensityTechnique: null,
                        isToFailure: false,
                        restSeconds: null,
                        tempo: null,
                        type: "warm_up",
                      },
                    ],
                    recordedSets: [],
                    skipReason: null,
                    skipReasonNote: null,
                    weightType: "none",
                    weightUnit: "kilogram",
                  },
                ],
                weightType: "total",
                weightUnit: "kilogram",
              },
              {
                amountUnit: "second",
                exerciseId: PLANK_EXERCISE_ID,
                id: generatedId,
                note: null,
                plannedNote: null,
                plannedSets: [],
                recordedSets: [],
                skipReason: null,
                skipReasonNote: null,
                warmUpExercises: [],
                weightType: "bodyweight",
                weightUnit: "kilogram",
              },
            ],
            id: generatedId,
          },
        ],
        warmUp: [
          {
            exercises: [
              {
                amountUnit: "repetition",
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: generatedId,
                note: null,
                plannedNote: "Slowly",
                plannedSets: [],
                recordedSets: [],
                skipReason: null,
                skipReasonNote: null,
                weightType: "none",
                weightUnit: "kilogram",
              },
            ],
            id: generatedId,
          },
        ],
      },
      startedAt: serverTime,
    });
  });

  it("keeps the Workout as it started when the User edits the Routine afterwards", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000211",
        id: "019a0000-0000-7000-8000-000000000111",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000311",
      }),
    );
    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000511",
      routineId: "019a0000-0000-7000-8000-000000000111",
    });

    await caller.routine.save({
      days: [],
      id: "019a0000-0000-7000-8000-000000000111",
      name: "Push day",
      sections: {
        coolDown: [],
        main: [
          {
            exercises: [
              {
                exerciseId: PLANK_EXERCISE_ID,
                id: "019a0000-0000-7000-8000-000000000312",
                note: "Brace",
                sets: [],
                warmUpExercises: [],
              },
            ],
            id: "019a0000-0000-7000-8000-000000000212",
          },
        ],
        warmUp: [],
      },
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              { exerciseId: BENCH_PRESS_EXERCISE_ID, plannedNote: null },
            ],
          },
        ],
      },
    });
  });

  it("succeeds without starting a second Workout when the User retries a start with the same id", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000221",
        id: "019a0000-0000-7000-8000-000000000121",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000321",
      }),
    );
    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000521",
      routineId: "019a0000-0000-7000-8000-000000000121",
    });

    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000521",
      routineId: "019a0000-0000-7000-8000-000000000121",
    });

    await caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000521" });
    await expect(caller.workout.findInProgress()).resolves.toBeNull();
  });

  it("fails with CONFLICT and WorkoutInProgressConflictError when the User starts a second Workout with another id", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000231",
        id: "019a0000-0000-7000-8000-000000000131",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000331",
      }),
    );
    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000531",
      routineId: "019a0000-0000-7000-8000-000000000131",
    });

    await expect(
      caller.workout.start({
        id: "019a0000-0000-7000-8000-000000000532",
        routineId: "019a0000-0000-7000-8000-000000000131",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutInProgressConflictError" },
      code: "CONFLICT",
    });
    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      id: "019a0000-0000-7000-8000-000000000531",
    });
  });

  it("ends two concurrent starts of Workouts with different ids with one Workout and one WorkoutInProgressConflictError", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000241",
        id: "019a0000-0000-7000-8000-000000000141",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000341",
      }),
    );

    const results = await Promise.allSettled([
      caller.workout.start({
        id: "019a0000-0000-7000-8000-000000000541",
        routineId: "019a0000-0000-7000-8000-000000000141",
      }),
      caller.workout.start({
        id: "019a0000-0000-7000-8000-000000000542",
        routineId: "019a0000-0000-7000-8000-000000000141",
      }),
    ]);

    expect(
      results.filter((result) => result.status === "rejected"),
    ).toMatchObject([
      {
        reason: {
          cause: { _tag: "WorkoutInProgressConflictError" },
          code: "CONFLICT",
        },
      },
    ]);
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for the id of another User's Workout, and leaves it in progress", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000243",
        id: "019a0000-0000-7000-8000-000000000143",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000343",
      }),
    );
    await otherCaller.workout.start({
      id: "019a0000-0000-7000-8000-000000000543",
      routineId: "019a0000-0000-7000-8000-000000000143",
    });
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000244",
        id: "019a0000-0000-7000-8000-000000000144",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000344",
      }),
    );

    await expect(
      caller.workout.start({
        id: "019a0000-0000-7000-8000-000000000543",
        routineId: "019a0000-0000-7000-8000-000000000144",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(otherCaller.workout.findInProgress()).resolves.toMatchObject({
      id: "019a0000-0000-7000-8000-000000000543",
    });
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for a Routine of another User", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000251",
        id: "019a0000-0000-7000-8000-000000000151",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000351",
      }),
    );
    const caller = await createSignedInCaller({ runtime });

    await expect(
      caller.workout.start({
        id: "019a0000-0000-7000-8000-000000000551",
        routineId: "019a0000-0000-7000-8000-000000000151",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(caller.workout.findInProgress()).resolves.toBeNull();
  });

  it("fails with NOT_FOUND and RoutineNotFoundError for a Routine the User deleted", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000261",
        id: "019a0000-0000-7000-8000-000000000161",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000361",
      }),
    );
    await caller.routine.delete({ id: "019a0000-0000-7000-8000-000000000161" });

    await expect(
      caller.workout.start({
        id: "019a0000-0000-7000-8000-000000000561",
        routineId: "019a0000-0000-7000-8000-000000000161",
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "RoutineNotFoundError" },
      code: "NOT_FOUND",
    });
  });
});

describe("workout.findInProgress", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("returns the time the Workout started, from the database's clock", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000283",
        id: "019a0000-0000-7000-8000-000000000183",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000383",
      }),
    );
    const timeBeforeStart = await readDatabaseTime(runtime);
    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000583",
      routineId: "019a0000-0000-7000-8000-000000000183",
    });
    const timeAfterStart = await readDatabaseTime(runtime);

    const workoutInProgress = await caller.workout.findInProgress();

    expect(workoutInProgress?.startedAt.getTime()).toBeGreaterThanOrEqual(
      timeBeforeStart,
    );
    expect(workoutInProgress?.startedAt.getTime()).toBeLessThanOrEqual(
      timeAfterStart,
    );
  });

  it("returns null when the User has no Workout in progress, leaving out their stopped Workouts and the Workouts of other Users", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000281",
        id: "019a0000-0000-7000-8000-000000000181",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000381",
      }),
    );
    await otherCaller.workout.start({
      id: "019a0000-0000-7000-8000-000000000581",
      routineId: "019a0000-0000-7000-8000-000000000181",
    });
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000282",
        id: "019a0000-0000-7000-8000-000000000182",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000382",
      }),
    );
    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000582",
      routineId: "019a0000-0000-7000-8000-000000000182",
    });
    await caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000582" });

    const workoutInProgress = await caller.workout.findInProgress();

    expect(workoutInProgress).toBeNull();
  });
});

describe("workout.stop", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("stops the User's Workout in progress, which then leaves workout.findInProgress", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000291",
        id: "019a0000-0000-7000-8000-000000000191",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000391",
      }),
    );
    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000591",
      routineId: "019a0000-0000-7000-8000-000000000191",
    });

    await caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000591" });

    await expect(caller.workout.findInProgress()).resolves.toBeNull();
  });

  it("succeeds without writing when the User stops a Workout they already stopped", async () => {
    const caller = await createSignedInCaller({ runtime });
    await caller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000292",
        id: "019a0000-0000-7000-8000-000000000192",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000392",
      }),
    );
    await caller.workout.start({
      id: "019a0000-0000-7000-8000-000000000592",
      routineId: "019a0000-0000-7000-8000-000000000192",
    });
    await stopWorkoutAt({
      endedAt: new Date("2026-10-29T10:00:00.000Z"),
      id: "019a0000-0000-7000-8000-000000000592",
      runtime,
    });

    await caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000592" });

    await expect(
      readWorkoutEndedAt({
        id: "019a0000-0000-7000-8000-000000000592",
        runtime,
      }),
    ).resolves.toStrictEqual(new Date("2026-10-29T10:00:00.000Z"));
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout that doesn't exist", async () => {
    const caller = await createSignedInCaller({ runtime });

    await expect(
      caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000593" }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout of another User, and leaves it in progress", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    await otherCaller.routine.save(
      buildRoutineSaveInput({
        exerciseGroupId: "019a0000-0000-7000-8000-000000000294",
        id: "019a0000-0000-7000-8000-000000000194",
        name: "Push day",
        routineExerciseId: "019a0000-0000-7000-8000-000000000394",
      }),
    );
    await otherCaller.workout.start({
      id: "019a0000-0000-7000-8000-000000000594",
      routineId: "019a0000-0000-7000-8000-000000000194",
    });
    const caller = await createSignedInCaller({ runtime });

    await expect(
      caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000594" }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(otherCaller.workout.findInProgress()).resolves.toMatchObject({
      id: "019a0000-0000-7000-8000-000000000594",
    });
  });
});

const WORKING_PLANNED_SET = {
  amount: 8,
  intensityTechnique: null,
  isToFailure: false,
  restSeconds: null,
  tempo: null,
  type: "working" as const,
};

describe("workout.saveSet", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("creates a Set in the Workout exercise, which workout.findInProgress returns with its Segments", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0601",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await caller.workout.saveSet({
      id: "019a0601-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 62.5 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              {
                recordedSets: [
                  {
                    id: "019a0601-0000-7000-8000-000000000101",
                    segments: [{ amount: 8, weight: 62.5 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it("updates a Set Saved again in place, keeping exactly the Segments the second Save sends", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0602",
      plannedSets: [
        {
          ...WORKING_PLANNED_SET,
          intensityTechnique: {
            _tag: "DropSet",
            segmentCount: 3,
            weightPercentage: 20,
          },
        },
      ],
    });
    await caller.workout.saveSet({
      id: "019a0602-0000-7000-8000-000000000101",
      segments: [
        { amount: 8, weight: 60 },
        { amount: 6, weight: 48 },
        { amount: 5, weight: 38.5 },
      ],
      weightUnit: "kilogram",
      workoutExerciseId,
    });

    await caller.workout.saveSet({
      id: "019a0602-0000-7000-8000-000000000101",
      segments: [
        { amount: 9, weight: 60 },
        { amount: 7, weight: 48 },
      ],
      weightUnit: "kilogram",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              {
                recordedSets: [
                  {
                    id: "019a0602-0000-7000-8000-000000000101",
                    segments: [
                      { amount: 9, weight: 60 },
                      { amount: 7, weight: 48 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it("Saves the Weight unit of the Set on its Workout exercise", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0603",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await caller.workout.saveSet({
      id: "019a0603-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 135 }],
      weightUnit: "pound",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: { main: [{ exercises: [{ weightUnit: "pound" }] }] },
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for the id of a Set in another User's Workout, and leaves that Set where it was", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    const otherWorkoutExerciseId = await startBenchPressWorkout({
      caller: otherCaller,
      idPrefix: "019a0604",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await otherCaller.workout.saveSet({
      id: "019a0604-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId: otherWorkoutExerciseId,
    });
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0605",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await expect(
      caller.workout.saveSet({
        id: "019a0604-0000-7000-8000-000000000101",
        segments: [{ amount: 1, weight: 0.01 }],
        weightUnit: "pound",
        workoutExerciseId,
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(otherCaller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              {
                recordedSets: [
                  {
                    id: "019a0604-0000-7000-8000-000000000101",
                    segments: [{ amount: 8, weight: 60 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [{ exercises: [{ recordedSets: [], weightUnit: "kilogram" }] }],
      },
    });
  });

  it("fails with UNPROCESSABLE_CONTENT and SegmentCountInvalidError for a Set with more Segments than its planned Set allows", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0606",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await expect(
      caller.workout.saveSet({
        id: "019a0606-0000-7000-8000-000000000101",
        segments: [
          { amount: 8, weight: 60 },
          { amount: 6, weight: 48 },
        ],
        weightUnit: "kilogram",
        workoutExerciseId,
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "SegmentCountInvalidError" },
      code: "UNPROCESSABLE_CONTENT",
    });
    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: { main: [{ exercises: [{ recordedSets: [] }] }] },
    });
  });

  it("fails with BAD_REQUEST for a Segment with no Amount", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0607",
      plannedSets: [WORKING_PLANNED_SET],
    });

    const segmentWithoutAmount = { amount: 8, weight: 60 };
    Reflect.deleteProperty(segmentWithoutAmount, "amount");

    await expect(
      caller.workout.saveSet({
        id: "019a0607-0000-7000-8000-000000000101",
        segments: [segmentWithoutAmount],
        weightUnit: "kilogram",
        workoutExerciseId,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: { main: [{ exercises: [{ recordedSets: [] }] }] },
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout exercise of a Workout the User stopped", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0608",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await caller.workout.stop({ id: "019a0608-0000-7000-8000-000000000004" });

    await expect(
      caller.workout.saveSet({
        id: "019a0608-0000-7000-8000-000000000101",
        segments: [{ amount: 8, weight: 60 }],
        weightUnit: "kilogram",
        workoutExerciseId,
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Set Saved while a stop of its Workout commits", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0609",
      plannedSets: [WORKING_PLANNED_SET],
    });
    const commitStop = await beginWorkoutStop({
      id: "019a0609-0000-7000-8000-000000000004",
      runtime,
    });

    const setSave = caller.workout.saveSet({
      id: "019a0609-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });
    await waitForLockWait(runtime);
    await commitStop();

    await expect(setSave).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
  });
});

describe("workout.removeSet", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("removes a recorded Set together with its Segments, and the recorded Sets after it move up one position", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0701",
      plannedSets: [WORKING_PLANNED_SET, WORKING_PLANNED_SET],
    });
    await caller.workout.saveSet({
      id: "019a0701-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });
    await caller.workout.saveSet({
      id: "019a0701-0000-7000-8000-000000000102",
      segments: [{ amount: 7, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });
    await caller.workout.saveSet({
      id: "019a0701-0000-7000-8000-000000000103",
      segments: [{ amount: 6, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });

    await caller.workout.removeSet({
      id: "019a0701-0000-7000-8000-000000000102",
      workoutExerciseId,
    });
    await caller.workout.saveSet({
      id: "019a0701-0000-7000-8000-000000000104",
      segments: [{ amount: 5, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              {
                recordedSets: [
                  {
                    id: "019a0701-0000-7000-8000-000000000101",
                    segments: [{ amount: 8, weight: 60 }],
                  },
                  {
                    id: "019a0701-0000-7000-8000-000000000103",
                    segments: [{ amount: 6, weight: 60 }],
                  },
                  {
                    id: "019a0701-0000-7000-8000-000000000104",
                    segments: [{ amount: 5, weight: 60 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    await expect(
      readSegmentCount({
        recordedSetId: "019a0701-0000-7000-8000-000000000102",
        runtime,
      }),
    ).resolves.toBe(0);
  });

  it("succeeds without writing when the User removes a Set they already removed", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0702",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await caller.workout.saveSet({
      id: "019a0702-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });
    await caller.workout.saveSet({
      id: "019a0702-0000-7000-8000-000000000102",
      segments: [{ amount: 7, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });
    await caller.workout.removeSet({
      id: "019a0702-0000-7000-8000-000000000102",
      workoutExerciseId,
    });

    await caller.workout.removeSet({
      id: "019a0702-0000-7000-8000-000000000102",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              {
                recordedSets: [{ id: "019a0702-0000-7000-8000-000000000101" }],
              },
            ],
          },
        ],
      },
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout exercise of another User's Workout, and leaves its Sets", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    const otherWorkoutExerciseId = await startBenchPressWorkout({
      caller: otherCaller,
      idPrefix: "019a0703",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await otherCaller.workout.saveSet({
      id: "019a0703-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId: otherWorkoutExerciseId,
    });
    const caller = await createSignedInCaller({ runtime });

    await expect(
      caller.workout.removeSet({
        id: "019a0703-0000-7000-8000-000000000101",
        workoutExerciseId: otherWorkoutExerciseId,
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(otherCaller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              {
                recordedSets: [{ id: "019a0703-0000-7000-8000-000000000101" }],
              },
            ],
          },
        ],
      },
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Set removed while a stop of its Workout commits", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0704",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await caller.workout.saveSet({
      id: "019a0704-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });
    const commitStop = await beginWorkoutStop({
      id: "019a0704-0000-7000-8000-000000000004",
      runtime,
    });

    const setRemoval = caller.workout.removeSet({
      id: "019a0704-0000-7000-8000-000000000101",
      workoutExerciseId,
    });
    await waitForLockWait(runtime);
    await commitStop();

    await expect(setRemoval).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
  });
});

describe("workout.skipExercise", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("Saves the reason and the note of a skip on the Workout exercise, which workout.findInProgress returns", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0801",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await caller.workout.skipExercise({
      note: "Sore shoulder",
      reason: "pain",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              { skipReason: "pain", skipReasonNote: "Sore shoulder" },
            ],
          },
        ],
      },
    });
  });

  it("Saves a skip with a reason and no note", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0802",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await caller.workout.skipExercise({
      note: null,
      reason: "low_on_time",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [{ skipReason: "low_on_time", skipReasonNote: null }],
          },
        ],
      },
    });
  });

  it("fails with BAD_REQUEST for a note with no reason, and leaves the Workout exercise as it was", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0803",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await expect(
      caller.workout.skipExercise({
        note: "Sore shoulder",
        reason: null,
        workoutExerciseId,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [{ exercises: [{ skipReason: null, skipReasonNote: null }] }],
      },
    });
  });

  it("keeps the Sets that the Workout exercise already records", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0804",
      plannedSets: [WORKING_PLANNED_SET, WORKING_PLANNED_SET],
    });
    await caller.workout.saveSet({
      id: "019a0804-0000-7000-8000-000000000101",
      segments: [{ amount: 8, weight: 60 }],
      weightUnit: "kilogram",
      workoutExerciseId,
    });

    await caller.workout.skipExercise({
      note: null,
      reason: "low_energy",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [
          {
            exercises: [
              {
                recordedSets: [
                  {
                    id: "019a0804-0000-7000-8000-000000000101",
                    segments: [{ amount: 8, weight: 60 }],
                  },
                ],
                skipReason: "low_energy",
              },
            ],
          },
        ],
      },
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout exercise of a Workout the User stopped", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0805",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await caller.workout.stop({ id: "019a0805-0000-7000-8000-000000000004" });

    await expect(
      caller.workout.skipExercise({
        note: null,
        reason: "pain",
        workoutExerciseId,
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout exercise of another User's Workout, and leaves it as it was", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    const otherWorkoutExerciseId = await startBenchPressWorkout({
      caller: otherCaller,
      idPrefix: "019a0806",
      plannedSets: [WORKING_PLANNED_SET],
    });
    const caller = await createSignedInCaller({ runtime });

    await expect(
      caller.workout.skipExercise({
        note: null,
        reason: "pain",
        workoutExerciseId: otherWorkoutExerciseId,
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(otherCaller.workout.findInProgress()).resolves.toMatchObject({
      sections: { main: [{ exercises: [{ skipReason: null }] }] },
    });
  });
});

describe("workout.saveNote", () => {
  const runtime = createTestRuntime();

  beforeAll(async () => {
    await insertExercises(runtime);
  });

  afterAll(async () => {
    await runtime.dispose();
  });

  it("Saves the note of the Workout exercise, which workout.findInProgress returns", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0901",
      plannedSets: [WORKING_PLANNED_SET],
    });

    await caller.workout.saveNote({
      note: "Felt strong today",
      workoutExerciseId,
    });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: {
        main: [{ exercises: [{ note: "Felt strong today" }] }],
      },
    });
  });

  it("clears the note of the Workout exercise when the User Saves no note", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0902",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await caller.workout.saveNote({
      note: "Felt strong today",
      workoutExerciseId,
    });

    await caller.workout.saveNote({ note: null, workoutExerciseId });

    await expect(caller.workout.findInProgress()).resolves.toMatchObject({
      sections: { main: [{ exercises: [{ note: null }] }] },
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout exercise of a Workout the User stopped", async () => {
    const caller = await createSignedInCaller({ runtime });
    const workoutExerciseId = await startBenchPressWorkout({
      caller,
      idPrefix: "019a0903",
      plannedSets: [WORKING_PLANNED_SET],
    });
    await caller.workout.stop({ id: "019a0903-0000-7000-8000-000000000004" });

    await expect(
      caller.workout.saveNote({ note: "Felt strong today", workoutExerciseId }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
  });

  it("fails with NOT_FOUND and WorkoutNotFoundError for a Workout exercise of another User's Workout, and leaves it as it was", async () => {
    const otherCaller = await createSignedInCaller({ runtime });
    const otherWorkoutExerciseId = await startBenchPressWorkout({
      caller: otherCaller,
      idPrefix: "019a0904",
      plannedSets: [WORKING_PLANNED_SET],
    });
    const caller = await createSignedInCaller({ runtime });

    await expect(
      caller.workout.saveNote({
        note: "Felt strong today",
        workoutExerciseId: otherWorkoutExerciseId,
      }),
    ).rejects.toMatchObject({
      cause: { _tag: "WorkoutNotFoundError" },
      code: "NOT_FOUND",
    });
    await expect(otherCaller.workout.findInProgress()).resolves.toMatchObject({
      sections: { main: [{ exercises: [{ note: null }] }] },
    });
  });
});
