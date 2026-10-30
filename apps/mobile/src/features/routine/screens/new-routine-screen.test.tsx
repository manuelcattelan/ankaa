import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { RoutineNameConflictError } from "@ankaa/core/features/routine/errors/routine-name-conflict-error";
import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { constUndefined } from "effect/Function";

import type { Exercise } from "#/shared/exercise-application-service.ts";
import type { FakeTrpcResponses } from "#/shared/testing/fake-trpc-client-layer.ts";

import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

const BENCH_PRESS_EXERCISE_ID = "01900000-0000-7000-8000-000000000001";

const PUSH_UP_EXERCISE_ID = "01900000-0000-7000-8000-000000000002";

const BAND_PULL_APART_EXERCISE_ID = "01900000-0000-7000-8000-000000000003";

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
    amountUnit: "repetition",
    equipment: [],
    id: PUSH_UP_EXERCISE_ID,
    muscleGroups: [{ muscleGroup: "chest", role: "primary" }],
    name: "Push-Up",
    weightType: "bodyweight",
  },
];

async function addExercise({
  addExerciseButtonIndex,
  exerciseName,
  user,
}: {
  addExerciseButtonIndex: number;
  exerciseName: string;
  user: ReturnType<typeof userEvent.setup>;
}) {
  await user.press(
    getButton({ index: addExerciseButtonIndex, name: "Add exercise" }),
  );
  await user.press(await screen.findByRole("button", { name: exerciseName }));
  await waitFor(() => {
    expect(
      screen.queryByRole("button", { name: exerciseName }),
    ).not.toBeOnTheScreen();
  });
}

async function buildPushDayDraft(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Push day");
  await addExercise({
    addExerciseButtonIndex: 1,
    exerciseName: "Bench Press (Barbell)",
    user,
  });
}

function getButton({ index, name }: { index: number; name: string }) {
  const button = screen.getAllByRole("button", { name }).at(index);

  if (button === undefined) {
    throw new Error(`No button "${name}" at index ${String(index)}`);
  }

  return button;
}

async function openNewRoutineScreen({
  receivedPaths = [],
  responses,
  unreachablePaths = [],
}: {
  receivedPaths?: string[];
  responses: FakeTrpcResponses;
  unreachablePaths?: (keyof FakeTrpcResponses)[];
}) {
  const user = userEvent.setup();
  renderScreen({
    initialUrl: "/",
    testRuntimeLayers: {
      authenticationClient: fakeSignedInAuthenticationClientLayer,
      crypto: fakeCryptoLayer,
      trpcClient: fakeTrpcClientLayer({
        receivedPaths,
        responses: {
          "exercise.list": () => EXERCISES,
          "routine.list": () => [],
          ...responses,
        },
        unreachablePaths,
      }),
    },
  });

  await user.press(await screen.findByRole("link", { name: "New routine" }));
  await screen.findByLabelText("Name");

  return user;
}

describe("NewRoutineScreen", () => {
  it("Saves the Routine that the User builds, with a Superset, a Warm-up exercise and a Drop set, as a tree", async () => {
    const savedInputs: RoutineSaveInput[] = [];
    const user = await openNewRoutineScreen({
      responses: {
        "routine.save": (input) => {
          savedInputs.push(input);
        },
      },
    });

    await buildPushDayDraft(user);
    await addExercise({
      addExerciseButtonIndex: 1,
      exerciseName: "Push-Up",
      user,
    });
    await user.press(
      getButton({ index: 0, name: "Superset with next exercise" }),
    );
    await user.press(getButton({ index: 0, name: "Add warm-up exercise" }));
    await user.press(
      await screen.findByRole("button", { name: "Band Pull-Apart" }),
    );
    await screen.findByText("Warm-up for Bench Press (Barbell)");
    await user.press(getButton({ index: 1, name: "Add set" }));
    await user.type(screen.getByLabelText("Repetitions or seconds"), "8");
    fireEvent(screen.getByTestId("Intensity technique"), "selectionChange", {
      nativeEvent: { selection: "drop_set" },
    });
    await user.type(
      await screen.findByLabelText("Segments, the first included"),
      "3",
    );
    await user.press(screen.getByRole("button", { name: "Save routine" }));

    await waitFor(() => {
      expect(savedInputs).toStrictEqual([
        {
          days: [],
          id: "00000000-0000-7000-8000-000000000007",
          name: "Push day",
          sections: {
            coolDown: [],
            main: [
              {
                exercises: [
                  {
                    exerciseId: BENCH_PRESS_EXERCISE_ID,
                    id: "00000000-0000-7000-8000-000000000002",
                    note: null,
                    sets: [
                      {
                        amount: 8,
                        id: "00000000-0000-7000-8000-000000000006",
                        intensityTechnique: {
                          _tag: "DropSet",
                          segmentCount: 3,
                          weightPercentage: null,
                        },
                        isToFailure: false,
                        restSeconds: null,
                        tempo: null,
                        type: "working",
                      },
                    ],
                    warmUpExercises: [
                      {
                        exerciseId: BAND_PULL_APART_EXERCISE_ID,
                        id: "00000000-0000-7000-8000-000000000005",
                        note: null,
                        sets: [],
                      },
                    ],
                  },
                  {
                    exerciseId: PUSH_UP_EXERCISE_ID,
                    id: "00000000-0000-7000-8000-000000000004",
                    note: null,
                    sets: [],
                    warmUpExercises: [],
                  },
                ],
                id: "00000000-0000-7000-8000-000000000001",
              },
            ],
            warmUp: [],
          },
        },
      ]);
    });
  });

  it("takes the User back to their Routines once the Routine is Saved", async () => {
    const user = await openNewRoutineScreen({
      responses: { "routine.save": constUndefined },
    });

    await buildPushDayDraft(user);
    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByRole("link", { name: "New routine" }),
    ).toBeOnTheScreen();
  });

  it("shows no error before the User first Saves", async () => {
    const user = await openNewRoutineScreen({ responses: {} });

    await addExercise({
      addExerciseButtonIndex: 1,
      exerciseName: "Bench Press (Barbell)",
      user,
    });
    await user.press(screen.getByRole("button", { name: "Add set" }));
    await user.type(screen.getByLabelText("Repetitions or seconds"), "0");

    expect(
      screen.queryByText(
        "This number isn't valid: enter a whole number of at least 1.",
      ),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByText("This routine has no name: enter a name."),
    ).not.toBeOnTheScreen();
  });

  it("shows the errors once the User Saves, and doesn't Save", async () => {
    const receivedPaths: string[] = [];
    const user = await openNewRoutineScreen({
      receivedPaths,
      responses: { "routine.save": constUndefined },
    });
    await addExercise({
      addExerciseButtonIndex: 1,
      exerciseName: "Bench Press (Barbell)",
      user,
    });
    await user.press(screen.getByRole("button", { name: "Add set" }));
    await user.type(screen.getByLabelText("Repetitions or seconds"), "0");

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByText("This routine has no name: enter a name."),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        "This number isn't valid: enter a whole number of at least 1.",
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Some fields aren't valid: correct the fields marked with an error.",
      ),
    ).toBeOnTheScreen();
    expect(receivedPaths).not.toContain("routine.save");
  });

  it("updates the errors as the User edits after the first Save", async () => {
    const receivedPaths: string[] = [];
    const user = await openNewRoutineScreen({
      receivedPaths,
      responses: { "routine.save": constUndefined },
    });
    await addExercise({
      addExerciseButtonIndex: 1,
      exerciseName: "Bench Press (Barbell)",
      user,
    });
    await user.press(screen.getByRole("button", { name: "Add set" }));
    await user.type(screen.getByLabelText("Repetitions or seconds"), "0");
    await user.press(screen.getByRole("button", { name: "Save routine" }));
    await screen.findByText("This routine has no name: enter a name.");

    await user.type(
      screen.getByLabelText(
        "Name, error: This routine has no name: enter a name.",
      ),
      "Push day",
    );

    expect(
      screen.queryByText("This routine has no name: enter a name."),
    ).not.toBeOnTheScreen();
    expect(
      screen.getByText(
        "This number isn't valid: enter a whole number of at least 1.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User that the main Section needs an exercise when they Save a Routine without one", async () => {
    const user = await openNewRoutineScreen({ responses: {} });
    await user.type(screen.getByLabelText("Name"), "Push day");

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByText(
        "This routine has no exercise in the main section: add an exercise to the main section.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User that they already have a Routine with the name when the server fails with RoutineNameConflictError", async () => {
    const user = await openNewRoutineScreen({
      responses: {
        "routine.save": () => {
          throw new RoutineNameConflictError();
        },
      },
    });
    await buildPushDayDraft(user);

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByText(
        "You already have a routine with this name: enter another name.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User that Ankaa can't connect when the Save can't reach the server, and keeps the Draft on screen", async () => {
    const user = await openNewRoutineScreen({
      responses: { "routine.save": constUndefined },
      unreachablePaths: ["routine.save"],
    });
    await buildPushDayDraft(user);

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Name")).toHaveDisplayValue("Push day");
    expect(screen.getByText("Bench Press (Barbell)")).toBeOnTheScreen();
  });
});
