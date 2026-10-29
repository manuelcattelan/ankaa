import type { WorkoutRemoveSetInput } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";
import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";

import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import type { Workout } from "#/features/workout/workout-application-service.ts";
import type { Exercise } from "#/shared/exercise-application-service.ts";

import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { pushDayRoutine } from "#/shared/testing/push-day-routine.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

const BAND_PULL_APART_EXERCISE_ID = "01900000-0000-7000-8000-000000000001";

const BENCH_PRESS_EXERCISE_ID = "01900000-0000-7000-8000-000000000002";

const PLANK_EXERCISE_ID = "01900000-0000-7000-8000-000000000003";

const PUSH_UP_EXERCISE_ID = "01900000-0000-7000-8000-000000000004";

const EXERCISES: Exercise[] = [
  {
    amountUnit: "repetition",
    equipment: [],
    id: BAND_PULL_APART_EXERCISE_ID,
    muscleGroups: [],
    name: "Band Pull-Apart",
    weightType: "none",
  },
  {
    amountUnit: "repetition",
    equipment: [{ equipment: "barbell" }, { equipment: "bench" }],
    id: BENCH_PRESS_EXERCISE_ID,
    muscleGroups: [{ muscleGroup: "chest", role: "primary" }],
    name: "Bench Press (Barbell)",
    weightType: "total",
  },
  {
    amountUnit: "second",
    equipment: [],
    id: PLANK_EXERCISE_ID,
    muscleGroups: [],
    name: "Plank",
    weightType: "bodyweight",
  },
  {
    amountUnit: "repetition",
    equipment: [],
    id: PUSH_UP_EXERCISE_ID,
    muscleGroups: [{ muscleGroup: "chest", role: "primary" }],
    name: "Push-Up",
    weightType: "bodyweight",
  },
];

const PUSH_DAY_WORKOUT: Workout = {
  id: "01900000-0000-7000-8000-000000000101",
  sections: {
    coolDown: [
      {
        exercises: [
          {
            amountUnit: "second",
            exerciseId: PLANK_EXERCISE_ID,
            id: "01900000-0000-7000-8000-000000000102",
            plannedNote: null,
            plannedSets: [
              {
                amount: 60,
                id: "01900000-0000-7000-8000-000000000103",
                intensityTechnique: null,
                isToFailure: false,
                restSeconds: null,
                tempo: null,
                type: "working",
              },
            ],
            recordedSets: [],
            weightType: "bodyweight",
            weightUnit: "kilogram",
          },
        ],
        id: "01900000-0000-7000-8000-000000000104",
      },
    ],
    main: [
      {
        exercises: [
          {
            amountUnit: "repetition",
            exerciseId: BENCH_PRESS_EXERCISE_ID,
            id: "01900000-0000-7000-8000-000000000105",
            plannedNote: "Pause at the chest",
            plannedSets: [
              {
                amount: 12,
                id: "01900000-0000-7000-8000-000000000106",
                intensityTechnique: null,
                isToFailure: false,
                restSeconds: 60,
                tempo: null,
                type: "warm_up",
              },
              {
                amount: 8,
                id: "01900000-0000-7000-8000-000000000107",
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
            recordedSets: [],
            warmUpExercises: [
              {
                amountUnit: "repetition",
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "01900000-0000-7000-8000-000000000108",
                plannedNote: null,
                plannedSets: [],
                recordedSets: [],
                weightType: "none",
                weightUnit: "kilogram",
              },
            ],
            weightType: "total",
            weightUnit: "kilogram",
          },
          {
            amountUnit: "repetition",
            exerciseId: PUSH_UP_EXERCISE_ID,
            id: "01900000-0000-7000-8000-000000000109",
            plannedNote: null,
            plannedSets: [
              {
                amount: null,
                id: "01900000-0000-7000-8000-000000000110",
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
            warmUpExercises: [],
            weightType: "bodyweight",
            weightUnit: "kilogram",
          },
        ],
        id: "01900000-0000-7000-8000-000000000111",
      },
    ],
    warmUp: [],
  },
};

const BENCH_PRESS_WORKOUT_EXERCISE_ID = "01900000-0000-7000-8000-000000000202";

const WORKING_PLANNED_SET = {
  amount: 8,
  id: "01900000-0000-7000-8000-000000000203",
  intensityTechnique: null,
  isToFailure: false,
  restSeconds: 120,
  tempo: null,
  type: "working" as const,
};

/**
 * Builds a Workout in progress of one Bench Press (Barbell) with its planned
 * and recorded Sets.
 */
function buildBenchPressWorkout({
  plannedSets,
  recordedSets,
}: {
  plannedSets: Workout["sections"]["main"][number]["exercises"][number]["plannedSets"];
  recordedSets: Workout["sections"]["main"][number]["exercises"][number]["recordedSets"];
}) {
  return {
    id: "01900000-0000-7000-8000-000000000201",
    sections: {
      coolDown: [],
      main: [
        {
          exercises: [
            {
              amountUnit: "repetition",
              exerciseId: BENCH_PRESS_EXERCISE_ID,
              id: BENCH_PRESS_WORKOUT_EXERCISE_ID,
              plannedNote: null,
              plannedSets,
              recordedSets,
              warmUpExercises: [],
              weightType: "total",
              weightUnit: "kilogram",
            },
          ],
          id: "01900000-0000-7000-8000-000000000204",
        },
      ],
      warmUp: [],
    },
  } satisfies Workout;
}

function getField({ index, label }: { index: number; label: string }) {
  const field = screen.getAllByLabelText(label).at(index);

  if (field === undefined) {
    throw new Error(`No field "${label}" at index ${String(index)}`);
  }

  return field;
}

describe("WorkoutScreen", () => {
  it("shows the plan of the User's Workout in progress, with its Sections, Supersets, Warm-up exercises, notes and planned Sets", async () => {
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () => PUSH_DAY_WORKOUT,
          },
        }),
      },
    });

    expect(await screen.findByText("Bench Press (Barbell)")).toBeOnTheScreen();
    expect(screen.getByText("Main")).toBeOnTheScreen();
    expect(screen.getByText("Superset")).toBeOnTheScreen();
    expect(
      screen.getByText("Warm-up for Bench Press (Barbell)"),
    ).toBeOnTheScreen();
    expect(screen.getByText("Cool-down")).toBeOnTheScreen();
    expect(screen.getByText("Band Pull-Apart")).toBeOnTheScreen();
    expect(screen.getByText("Push-Up")).toBeOnTheScreen();
    expect(screen.getByText("Plank")).toBeOnTheScreen();
    expect(
      screen.getByText("Routine note: Pause at the chest"),
    ).toBeOnTheScreen();
    expect(screen.getByText("Set 1, warm-up")).toBeOnTheScreen();
    expect(screen.getByText("12 repetitions")).toBeOnTheScreen();
    expect(screen.getByText("Rest: 60 seconds")).toBeOnTheScreen();
    expect(screen.getByText("8 repetitions")).toBeOnTheScreen();
    expect(screen.getByText("Tempo 3-0-1-2")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "The seconds for lowering, holding at the bottom, lifting and holding at the top. X means lifting as fast as you can.",
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Drop set: take off 20% at each drop"),
    ).toBeOnTheScreen();
    expect(screen.getByText("Rest: 120 seconds")).toBeOnTheScreen();
    expect(screen.getByText("To failure")).toBeOnTheScreen();
    expect(
      screen.getByText("Rest-pause set: 3 segments, with pauses of 15 seconds"),
    ).toBeOnTheScreen();
    expect(screen.getByText("60 seconds")).toBeOnTheScreen();
  });

  it("stops the User's Workout in progress and takes them to the home screen, which offers to start a Workout again", async () => {
    const stoppedInputs: WorkoutStopInput[] = [];
    let workoutInProgress: null | Workout = PUSH_DAY_WORKOUT;
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "routine.list": () => [pushDayRoutine],
            "workout.findInProgress": () => workoutInProgress,
            "workout.stop": (input) => {
              stoppedInputs.push(input);
              workoutInProgress = null;
            },
          },
        }),
      },
    });
    await user.press(
      await screen.findByRole("link", { name: "Resume workout" }),
    );

    await user.press(
      await screen.findByRole("button", { name: "Stop workout" }),
    );

    expect(
      await screen.findByRole("button", { name: "Start Push day" }),
    ).toBeOnTheScreen();
    expect(stoppedInputs).toStrictEqual([
      { id: "01900000-0000-7000-8000-000000000101" },
    ]);
  });

  it("tells the User that Ankaa can't connect when a stop can't reach the server, and keeps the Workout on the screen", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () => PUSH_DAY_WORKOUT,
          },
          unreachablePaths: ["workout.stop"],
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Stop workout" }),
    );

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText("Bench Press (Barbell)")).toBeOnTheScreen();
  });

  it("tells the User they have no Workout in progress when none is", async () => {
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () => null,
          },
        }),
      },
    });

    expect(
      await screen.findByText("You have no workout in progress."),
    ).toBeOnTheScreen();
  });

  it("Saves a Set that the User fills in through Save set, and counts it as a done Working set", async () => {
    const savedInputs: WorkoutSaveSetInput[] = [];
    let workoutInProgress = buildBenchPressWorkout({
      plannedSets: [WORKING_PLANNED_SET, WORKING_PLANNED_SET],
      recordedSets: [],
    });
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        crypto: fakeCryptoLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () => workoutInProgress,
            "workout.saveSet": (input) => {
              savedInputs.push(input);
              workoutInProgress = buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET, WORKING_PLANNED_SET],
                recordedSets: [
                  {
                    id: "00000000-0000-7000-8000-000000000001",
                    segments: [{ amount: 8, weight: 62.5 }],
                  },
                ],
              });
            },
          },
        }),
      },
    });
    await user.type(await screen.findByLabelText("Repetitions"), "8");
    await user.type(screen.getByLabelText("Weight, in kilograms"), "62.5");

    await user.press(screen.getByRole("button", { name: "Save set" }));

    expect(
      await screen.findByText("1 working set done, 1 left."),
    ).toBeOnTheScreen();
    expect(savedInputs).toStrictEqual([
      {
        id: "00000000-0000-7000-8000-000000000001",
        segments: [{ amount: 8, weight: 62.5 }],
        weightUnit: "kilogram",
        workoutExerciseId: BENCH_PRESS_WORKOUT_EXERCISE_ID,
      },
    ]);
  });

  it("Saves the Weight unit that the User picks with the Set", async () => {
    const savedInputs: WorkoutSaveSetInput[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        crypto: fakeCryptoLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              }),
            "workout.saveSet": (input) => {
              savedInputs.push(input);
            },
          },
        }),
      },
    });
    fireEvent(await screen.findByTestId("Weight unit"), "selectionChange", {
      nativeEvent: { selection: "pound" },
    });
    await user.type(screen.getByLabelText("Repetitions"), "8");
    await user.type(screen.getByLabelText("Weight, in pounds"), "135");

    await user.press(screen.getByRole("button", { name: "Save set" }));

    await waitFor(() => {
      expect(savedInputs).toStrictEqual([
        {
          id: "00000000-0000-7000-8000-000000000001",
          segments: [{ amount: 8, weight: 135 }],
          weightUnit: "pound",
          workoutExerciseId: BENCH_PRESS_WORKOUT_EXERCISE_ID,
        },
      ]);
    });
  });

  it("Saves a Drop set with the Segments the User adds, up to its planned Segment count", async () => {
    const savedInputs: WorkoutSaveSetInput[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        crypto: fakeCryptoLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [
                  {
                    ...WORKING_PLANNED_SET,
                    intensityTechnique: {
                      _tag: "DropSet",
                      segmentCount: 2,
                      weightPercentage: 20,
                    },
                  },
                ],
                recordedSets: [],
              }),
            "workout.saveSet": (input) => {
              savedInputs.push(input);
            },
          },
        }),
      },
    });
    await user.press(
      await screen.findByRole("button", { name: "Add segment" }),
    );
    await user.type(getField({ index: 0, label: "Repetitions" }), "8");
    await user.type(
      getField({ index: 0, label: "Weight, in kilograms" }),
      "60",
    );
    await user.type(getField({ index: 1, label: "Repetitions" }), "6");
    await user.type(
      getField({ index: 1, label: "Weight, in kilograms" }),
      "48",
    );

    await user.press(screen.getByRole("button", { name: "Save set" }));

    await waitFor(() => {
      expect(savedInputs).toStrictEqual([
        {
          id: "00000000-0000-7000-8000-000000000001",
          segments: [
            { amount: 8, weight: 60 },
            { amount: 6, weight: 48 },
          ],
          weightUnit: "kilogram",
          workoutExerciseId: BENCH_PRESS_WORKOUT_EXERCISE_ID,
        },
      ]);
    });
    expect(
      screen.queryByRole("button", { name: "Add segment" }),
    ).not.toBeOnTheScreen();
  });

  it("counts the recorded Working sets as done and the planned ones left, leaving out Warm-up sets", async () => {
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [
                  { ...WORKING_PLANNED_SET, type: "warm_up" },
                  WORKING_PLANNED_SET,
                  WORKING_PLANNED_SET,
                  WORKING_PLANNED_SET,
                ],
                recordedSets: [
                  {
                    id: "01900000-0000-7000-8000-000000000301",
                    segments: [{ amount: 12, weight: 40 }],
                  },
                  {
                    id: "01900000-0000-7000-8000-000000000302",
                    segments: [{ amount: 8, weight: 60 }],
                  },
                ],
              }),
          },
        }),
      },
    });

    expect(
      await screen.findByText("1 working set done, 2 left."),
    ).toBeOnTheScreen();
  });

  it("removes the last recorded Set through Remove set", async () => {
    const removedInputs: WorkoutRemoveSetInput[] = [];
    let workoutInProgress = buildBenchPressWorkout({
      plannedSets: [WORKING_PLANNED_SET],
      recordedSets: [
        {
          id: "01900000-0000-7000-8000-000000000301",
          segments: [{ amount: 8, weight: 60 }],
        },
      ],
    });
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () => workoutInProgress,
            "workout.removeSet": (input) => {
              removedInputs.push(input);
              workoutInProgress = buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              });
            },
          },
        }),
      },
    });

    await user.press(await screen.findByRole("button", { name: "Remove set" }));

    expect(
      await screen.findByText("0 working sets done, 1 left."),
    ).toBeOnTheScreen();
    expect(removedInputs).toStrictEqual([
      { workoutExerciseId: BENCH_PRESS_WORKOUT_EXERCISE_ID },
    ]);
  });

  it("refuses to stop the Workout while a Set has a Draft the User hasn't Saved, naming that Set", async () => {
    const stoppedInputs: WorkoutStopInput[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              }),
            "workout.stop": (input) => {
              stoppedInputs.push(input);
            },
          },
        }),
      },
    });
    await user.type(await screen.findByLabelText("Repetitions"), "8");

    await user.press(screen.getByRole("button", { name: "Stop workout" }));

    expect(
      await screen.findByText(
        "You haven't saved these sets: Bench Press (Barbell), set 1. Save them before you stop the workout.",
      ),
    ).toBeOnTheScreen();
    expect(stoppedInputs).toStrictEqual([]);
  });

  it("tells the User that Ankaa can't connect when a Save can't reach the server, and keeps the Draft on the screen", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        crypto: fakeCryptoLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              }),
          },
          unreachablePaths: ["workout.saveSet"],
        }),
      },
    });
    await user.type(await screen.findByLabelText("Repetitions"), "8");
    await user.type(screen.getByLabelText("Weight, in kilograms"), "62.5");

    await user.press(screen.getByRole("button", { name: "Save set" }));

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Repetitions")).toHaveDisplayValue("8");
    expect(screen.getByLabelText("Weight, in kilograms")).toHaveDisplayValue(
      "62.5",
    );
  });
});
