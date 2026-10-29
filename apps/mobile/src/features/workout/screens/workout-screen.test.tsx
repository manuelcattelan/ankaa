import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";

import { screen, userEvent } from "@testing-library/react-native";

import type { Workout } from "#/features/workout/workout-application-service.ts";
import type { Exercise } from "#/shared/exercise-application-service.ts";

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
            weightType: "bodyweight",
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
            warmUpExercises: [
              {
                amountUnit: "repetition",
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "01900000-0000-7000-8000-000000000108",
                plannedNote: null,
                plannedSets: [],
                weightType: "none",
              },
            ],
            weightType: "total",
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
            warmUpExercises: [],
            weightType: "bodyweight",
          },
        ],
        id: "01900000-0000-7000-8000-000000000111",
      },
    ],
    warmUp: [],
  },
};

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
      screen.getByText(
        "Drop set: 3 segments, dropping 20% of the weight each time",
      ),
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
});
