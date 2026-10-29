import type { SkipReason } from "@ankaa/core/features/workout/constants/skip-reasons";
import type { WorkoutRemoveSetInput } from "@ankaa/core/features/workout/schemas/workout-remove-set-input-schema";
import type { WorkoutSaveNoteInput } from "@ankaa/core/features/workout/schemas/workout-save-note-input-schema";
import type { WorkoutSaveSetInput } from "@ankaa/core/features/workout/schemas/workout-save-set-input-schema";
import type { WorkoutSkipExerciseInput } from "@ankaa/core/features/workout/schemas/workout-skip-exercise-input-schema";
import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";

import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import type { Workout } from "#/features/workout/workout-application-service.ts";
import type { Exercise } from "#/shared/exercise-application-service.ts";
import type {
  NotificationPermissionStatus,
  ScheduledNotification,
} from "#/shared/services/notifications.ts";

import { advanceFakeTime } from "#/shared/testing/advance-fake-time.ts";
import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
import { fakeNotificationsLayer } from "#/shared/testing/fake-notifications-layer.ts";
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
            note: null,
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
            skipReason: null,
            skipReasonNote: null,
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
            note: null,
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
            skipReason: null,
            skipReasonNote: null,
            warmUpExercises: [
              {
                amountUnit: "repetition",
                exerciseId: BAND_PULL_APART_EXERCISE_ID,
                id: "01900000-0000-7000-8000-000000000108",
                note: null,
                plannedNote: null,
                plannedSets: [],
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
            amountUnit: "repetition",
            exerciseId: PUSH_UP_EXERCISE_ID,
            id: "01900000-0000-7000-8000-000000000109",
            note: null,
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
            skipReason: null,
            skipReasonNote: null,
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
 * and recorded Sets, and its note and skip, which are empty by default.
 */
function buildBenchPressWorkout({
  note = null,
  plannedSets,
  recordedSets,
  skipReason = null,
  skipReasonNote = null,
}: {
  note?: null | string;
  plannedSets: Workout["sections"]["main"][number]["exercises"][number]["plannedSets"];
  recordedSets: Workout["sections"]["main"][number]["exercises"][number]["recordedSets"];
  skipReason?: null | SkipReason;
  skipReasonNote?: null | string;
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
              note,
              plannedNote: null,
              plannedSets,
              recordedSets,
              skipReason,
              skipReasonNote,
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

function getButton({ index, name }: { index: number; name: string }) {
  const button = screen.getAllByRole("button", { name }).at(index);

  if (button === undefined) {
    throw new Error(`No button "${name}" at index ${String(index)}`);
  }

  return button;
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

  it("removes any recorded Set through its Remove set", async () => {
    const removedInputs: WorkoutRemoveSetInput[] = [];
    let workoutInProgress = buildBenchPressWorkout({
      plannedSets: [WORKING_PLANNED_SET, WORKING_PLANNED_SET],
      recordedSets: [
        {
          id: "01900000-0000-7000-8000-000000000301",
          segments: [{ amount: 8, weight: 60 }],
        },
        {
          id: "01900000-0000-7000-8000-000000000302",
          segments: [{ amount: 7, weight: 60 }],
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
                plannedSets: [WORKING_PLANNED_SET, WORKING_PLANNED_SET],
                recordedSets: [
                  {
                    id: "01900000-0000-7000-8000-000000000302",
                    segments: [{ amount: 7, weight: 60 }],
                  },
                ],
              });
            },
          },
        }),
      },
    });
    await screen.findByText("2 working sets done, 0 left.");

    await user.press(getButton({ index: 0, name: "Remove set" }));

    expect(
      await screen.findByText("1 working set done, 1 left."),
    ).toBeOnTheScreen();
    expect(removedInputs).toStrictEqual([
      {
        id: "01900000-0000-7000-8000-000000000301",
        workoutExerciseId: BENCH_PRESS_WORKOUT_EXERCISE_ID,
      },
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
        "You haven't saved these: Bench Press (Barbell), set 1. Save them before you stop the workout.",
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

  it("Saves the note that the User writes on a Workout exercise through Save note", async () => {
    const savedInputs: WorkoutSaveNoteInput[] = [];
    let workoutInProgress = buildBenchPressWorkout({
      plannedSets: [WORKING_PLANNED_SET],
      recordedSets: [],
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
            "workout.saveNote": (input) => {
              savedInputs.push(input);
              workoutInProgress = buildBenchPressWorkout({
                note: "Felt strong today",
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              });
            },
          },
        }),
      },
    });
    await user.type(
      await screen.findByLabelText("Note for this workout"),
      "Felt strong today",
    );

    await user.press(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => {
      expect(savedInputs).toStrictEqual([
        {
          note: "Felt strong today",
          workoutExerciseId: BENCH_PRESS_WORKOUT_EXERCISE_ID,
        },
      ]);
    });
    expect(screen.getByLabelText("Note for this workout")).toHaveDisplayValue(
      "Felt strong today",
    );
  });

  it("refuses to stop the Workout while a note has a Draft the User hasn't Saved, naming its Workout exercise", async () => {
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
    await user.type(
      await screen.findByLabelText("Note for this workout"),
      "Felt strong today",
    );

    await user.press(screen.getByRole("button", { name: "Stop workout" }));

    expect(
      await screen.findByText(
        "You haven't saved these: Bench Press (Barbell), note. Save them before you stop the workout.",
      ),
    ).toBeOnTheScreen();
    expect(stoppedInputs).toStrictEqual([]);
  });

  it("Saves the skip of a Workout exercise, with the reason the User picks and their note, through Save skip", async () => {
    const skippedInputs: WorkoutSkipExerciseInput[] = [];
    let workoutInProgress = buildBenchPressWorkout({
      plannedSets: [WORKING_PLANNED_SET],
      recordedSets: [],
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
            "workout.skipExercise": (input) => {
              skippedInputs.push(input);
              workoutInProgress = buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
                skipReason: "pain",
                skipReasonNote: "Sore shoulder",
              });
            },
          },
        }),
      },
    });
    fireEvent(await screen.findByTestId("Skipped"), "selectionChange", {
      nativeEvent: { selection: "pain" },
    });
    await user.type(
      screen.getByLabelText("Why you skipped it"),
      "Sore shoulder",
    );

    await user.press(screen.getByRole("button", { name: "Save skip" }));

    await waitFor(() => {
      expect(skippedInputs).toStrictEqual([
        {
          note: "Sore shoulder",
          reason: "pain",
          workoutExerciseId: BENCH_PRESS_WORKOUT_EXERCISE_ID,
        },
      ]);
    });
    expect(screen.getByLabelText("Why you skipped it")).toHaveDisplayValue(
      "Sore shoulder",
    );
  });

  it("refuses to stop the Workout while a skip has a Draft the User hasn't Saved, naming its Workout exercise", async () => {
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
    fireEvent(await screen.findByTestId("Skipped"), "selectionChange", {
      nativeEvent: { selection: "low_on_time" },
    });

    await user.press(screen.getByRole("button", { name: "Stop workout" }));

    expect(
      await screen.findByText(
        "You haven't saved these: Bench Press (Barbell), skip. Save them before you stop the workout.",
      ),
    ).toBeOnTheScreen();
    expect(stoppedInputs).toStrictEqual([]);
  });

  it("refuses to Save a skip with a note and no reason, telling the User to pick a reason", async () => {
    const receivedPaths: string[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          receivedPaths,
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              }),
          },
        }),
      },
    });
    await user.type(
      await screen.findByLabelText("Why you skipped it"),
      "Sore shoulder",
    );

    await user.press(screen.getByRole("button", { name: "Save skip" }));

    expect(
      await screen.findByText(
        "This note needs a reason: pick why you skipped the exercise, or clear the note.",
      ),
    ).toBeOnTheScreen();
    expect(receivedPaths).not.toContain("workout.skipExercise");
  });

  it("tells the User that Ankaa can't connect when a note's Save can't reach the server, and keeps the Draft on the screen", async () => {
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
          },
          unreachablePaths: ["workout.saveNote"],
        }),
      },
    });
    await user.type(
      await screen.findByLabelText("Note for this workout"),
      "Felt strong today",
    );

    await user.press(screen.getByRole("button", { name: "Save note" }));

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Note for this workout")).toHaveDisplayValue(
      "Felt strong today",
    );
  });

  it("counts down the planned Rest of a Set when the User starts it under that Set, and adds no Set", async () => {
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
          },
        }),
      },
    });
    await user.press(await screen.findByRole("button", { name: "Start rest" }));

    await advanceFakeTime(30_000);

    expect(screen.getByText("Rest: 90 seconds left")).toBeOnTheScreen();
    expect(screen.getByText("0 working sets done, 1 left.")).toBeOnTheScreen();
    expect(screen.getAllByRole("button", { name: "Save set" })).toHaveLength(1);
  });

  it("offers Start rest only under the Sets of a Superset's last exercise", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () => ({
              id: "01900000-0000-7000-8000-000000000301",
              sections: {
                coolDown: [],
                main: [
                  {
                    exercises: [
                      {
                        amountUnit: "repetition",
                        exerciseId: BENCH_PRESS_EXERCISE_ID,
                        id: "01900000-0000-7000-8000-000000000302",
                        note: null,
                        plannedNote: null,
                        plannedSets: [
                          { ...WORKING_PLANNED_SET, restSeconds: 90 },
                        ],
                        recordedSets: [],
                        skipReason: null,
                        skipReasonNote: null,
                        warmUpExercises: [],
                        weightType: "total",
                        weightUnit: "kilogram",
                      },
                      {
                        amountUnit: "repetition",
                        exerciseId: PUSH_UP_EXERCISE_ID,
                        id: "01900000-0000-7000-8000-000000000303",
                        note: null,
                        plannedNote: null,
                        plannedSets: [
                          { ...WORKING_PLANNED_SET, restSeconds: 60 },
                        ],
                        recordedSets: [],
                        skipReason: null,
                        skipReasonNote: null,
                        warmUpExercises: [],
                        weightType: "bodyweight",
                        weightUnit: "kilogram",
                      },
                    ],
                    id: "01900000-0000-7000-8000-000000000304",
                  },
                ],
                warmUp: [],
              },
            }),
          },
        }),
      },
    });
    await screen.findByText("Push-Up");

    await user.press(screen.getByRole("button", { name: "Start rest" }));

    expect(screen.getByText("Rest: 60 seconds left")).toBeOnTheScreen();
  });

  it("counts down a Pause of a Rest-pause set under its own label when the User starts it", async () => {
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
                plannedSets: [
                  {
                    ...WORKING_PLANNED_SET,
                    intensityTechnique: {
                      _tag: "RestPauseSet",
                      pauseSeconds: 15,
                      segmentCount: 3,
                    },
                  },
                ],
                recordedSets: [],
              }),
          },
        }),
      },
    });
    await user.press(
      await screen.findByRole("button", { name: "Start pause" }),
    );

    await advanceFakeTime(5000);

    expect(screen.getByText("Pause: 10 seconds left")).toBeOnTheScreen();
  });

  it("asks for notification permission when the User starts a countdown for the first time, not when the app opens", async () => {
    const permissionRequests: NotificationPermissionStatus[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        notifications: fakeNotificationsLayer({ permissionRequests }),
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              }),
          },
        }),
      },
    });
    const startRestButton = await screen.findByRole("button", {
      name: "Start rest",
    });

    expect(permissionRequests).toStrictEqual([]);

    await user.press(startRestButton);

    await waitFor(() => {
      expect(permissionRequests).toStrictEqual(["granted"]);
    });
  });

  it("schedules a notification for the end of the Rest that the User starts", async () => {
    const scheduledNotifications: ScheduledNotification[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        notifications: fakeNotificationsLayer({ scheduledNotifications }),
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [WORKING_PLANNED_SET],
                recordedSets: [],
              }),
          },
        }),
      },
    });

    await user.press(await screen.findByRole("button", { name: "Start rest" }));

    await waitFor(() => {
      expect(scheduledNotifications).toStrictEqual([
        {
          body: "Start your next set.",
          seconds: 120,
          title: "Your rest is over",
        },
      ]);
    });
  });

  it("cancels the notification of the countdown when the User stops the Workout", async () => {
    const scheduledNotifications: ScheduledNotification[] = [];
    let workoutInProgress: null | Workout = buildBenchPressWorkout({
      plannedSets: [WORKING_PLANNED_SET],
      recordedSets: [],
    });
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        notifications: fakeNotificationsLayer({ scheduledNotifications }),
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "routine.list": () => [pushDayRoutine],
            "workout.findInProgress": () => workoutInProgress,
            "workout.stop": () => {
              workoutInProgress = null;
            },
          },
        }),
      },
    });
    await user.press(await screen.findByRole("button", { name: "Start rest" }));
    await waitFor(() => {
      expect(scheduledNotifications).toHaveLength(1);
    });

    await user.press(screen.getByRole("button", { name: "Stop workout" }));
    await screen.findByRole("button", { name: "Start Push day" });

    expect(scheduledNotifications).toStrictEqual([]);
  });

  it("replaces the countdown and the notification of an earlier countdown when the User starts another, without asking for permission again", async () => {
    const permissionRequests: NotificationPermissionStatus[] = [];
    const scheduledNotifications: ScheduledNotification[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/workout",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        notifications: fakeNotificationsLayer({
          permissionRequests,
          scheduledNotifications,
        }),
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => EXERCISES,
            "workout.findInProgress": () =>
              buildBenchPressWorkout({
                plannedSets: [
                  {
                    ...WORKING_PLANNED_SET,
                    intensityTechnique: {
                      _tag: "RestPauseSet",
                      pauseSeconds: 15,
                      segmentCount: 3,
                    },
                  },
                ],
                recordedSets: [],
              }),
          },
        }),
      },
    });
    await user.press(await screen.findByRole("button", { name: "Start rest" }));
    await waitFor(() => {
      expect(scheduledNotifications).toHaveLength(1);
    });

    await user.press(screen.getByRole("button", { name: "Start pause" }));

    await waitFor(() => {
      expect(scheduledNotifications).toStrictEqual([
        {
          body: "Start the next segment of your set.",
          seconds: 15,
          title: "Your pause is over",
        },
      ]);
    });
    expect(screen.getByText("Pause: 15 seconds left")).toBeOnTheScreen();
    expect(screen.queryByText("Rest: 120 seconds left")).toBeNull();
    expect(permissionRequests).toStrictEqual(["granted"]);
  });

  it("ends the countdown when its time is up, and offers to start it again", async () => {
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
          },
        }),
      },
    });
    await user.press(await screen.findByRole("button", { name: "Start rest" }));

    await advanceFakeTime(120_000);

    expect(screen.queryByText("Rest: 0 seconds left")).toBeNull();
    expect(screen.queryByText("Rest: 1 second left")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Start rest" }),
    ).toBeOnTheScreen();
  });
});
