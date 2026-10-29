import { Database } from "@ankaa/database/database";
import { exercise } from "@ankaa/database/schema/exercise";
import { workout } from "@ankaa/database/schema/workout";
import { eq } from "drizzle-orm";
import * as Effect from "effect/Effect";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { createSignedInCaller } from "#/shared/testing/create-signed-in-caller.ts";
import { createTestRuntime } from "#/shared/testing/create-test-runtime.ts";

const generatedId: unknown = expect.any(String);

const BENCH_PRESS_EXERCISE_ID = "019a0000-0000-7000-8000-000000000001";

const PLANK_EXERCISE_ID = "019a0000-0000-7000-8000-000000000002";

const BAND_PULL_APART_EXERCISE_ID = "019a0000-0000-7000-8000-000000000003";

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
                weightType: "bodyweight",
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
                warmUpExercises: [
                  {
                    amountUnit: "repetition",
                    exerciseId: BAND_PULL_APART_EXERCISE_ID,
                    id: generatedId,
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
                    weightType: "none",
                  },
                ],
                weightType: "total",
              },
              {
                amountUnit: "second",
                exerciseId: PLANK_EXERCISE_ID,
                id: generatedId,
                plannedNote: null,
                plannedSets: [],
                warmUpExercises: [],
                weightType: "bodyweight",
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
                plannedNote: "Slowly",
                plannedSets: [],
                weightType: "none",
              },
            ],
            id: generatedId,
          },
        ],
      },
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
    await caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000592" });
    const endedAt = await readWorkoutEndedAt({
      id: "019a0000-0000-7000-8000-000000000592",
      runtime,
    });

    await caller.workout.stop({ id: "019a0000-0000-7000-8000-000000000592" });

    await expect(
      readWorkoutEndedAt({
        id: "019a0000-0000-7000-8000-000000000592",
        runtime,
      }),
    ).resolves.toStrictEqual(endedAt);
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
