import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { TRPCError } from "@trpc/server";

import type { WorkoutDocument } from "@/features/workout/core/workout-document-schema";
import type { Exercise } from "@/shared/interactors/list-exercises";
import type { TestRuntimeLayers } from "@/shared/testing/create-test-runtime";

import { parseStoredWorkoutDocument } from "@/features/workout/core/parse-stored-workout-document";
import { WorkoutDocumentStorage } from "@/features/workout/services/workout-document-storage";
import { AuthenticationClient } from "@/shared/services/authentication-client";
import { TrpcClient } from "@/shared/services/trpc-client";
import { choosePickerFieldOption } from "@/shared/testing/choose-picker-field-option";
import { renderScreen } from "@/shared/testing/render-screen";
import { signedInSession } from "@/shared/testing/signed-in-session";

const BENCH_PRESS_EXERCISE: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [{ equipment: "barbell" }, { equipment: "bench" }],
  exerciseMuscleGroups: [{ muscleGroup: "chest", muscleGroupRole: "primary" }],
  id: "01900000-0000-7000-8000-000000000001",
  name: "Bench Press (Barbell)",
  weightType: "total",
};

const PUSH_DAY_WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [
    {
      amountUnit: "repetition",
      exerciseId: "01900000-0000-7000-8000-000000000001",
      id: "01900000-0000-7000-8000-000000000006",
      note: "",
      routineExerciseSets: [
        { amount: 8, isToFailure: false, restSeconds: 120, setType: "working" },
        { amount: 8, isToFailure: false, restSeconds: 120, setType: "working" },
      ],
      section: "main",
      sets: [],
      skipReasonNote: "",
      weightType: "total",
    },
  ],
  id: "01900000-0000-7000-8000-000000000005",
  routineId: "01900000-0000-7000-8000-000000000004",
  startedAt: "2026-10-19T09:00:00.000Z",
  syncedVersion: 1,
  userId: "user-1",
  version: 1,
};

const SIGNED_IN_AUTHENTICATION_CLIENT_LAYER = AuthenticationClient.layerTest({
  "/get-session": () => Response.json(signedInSession),
});

const TRPC_CLIENT_LAYER = TrpcClient.layerTest({
  exercise: { list: () => [BENCH_PRESS_EXERCISE] },
  routine: { list: () => [] },
});

describe("WorkoutScreen", () => {
  it("shows one more working Set done when the person adds a Set", async () => {
    const user = await openWorkoutScreen({
      trpcClientLayer: TRPC_CLIENT_LAYER,
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storeWorkoutDocument(PUSH_DAY_WORKOUT_DOCUMENT),
      ),
    });

    await user.press(screen.getByRole("button", { name: "Add set" }));

    expect(
      await screen.findByText("1 working set done, 1 left."),
    ).toBeOnTheScreen();
  });

  it("Stores the Repetitions that the person enters for a Set on the device", async () => {
    const storedWorkoutDocumentJsons = storeWorkoutDocument(
      PUSH_DAY_WORKOUT_DOCUMENT,
    );
    const user = await openWorkoutScreen({
      trpcClientLayer: TRPC_CLIENT_LAYER,
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storedWorkoutDocumentJsons,
      ),
    });

    await user.press(screen.getByRole("button", { name: "Add set" }));

    await user.type(await screen.findByLabelText("Repetitions"), "8");

    await waitFor(() => {
      expect(
        readStoredWorkoutDocuments(storedWorkoutDocumentJsons),
      ).toMatchObject([
        {
          _tag: "StoredWorkoutDocumentParsed",
          workoutDocument: {
            exercises: [{ sets: [{ segments: [{ amount: "8" }] }] }],
          },
        },
      ]);
    });
  });

  it("Saves the Workout 2 seconds after the person changes it", async () => {
    const storedWorkoutDocumentJsons = storeWorkoutDocument(
      PUSH_DAY_WORKOUT_DOCUMENT,
    );
    const user = await openWorkoutScreen({
      trpcClientLayer: TrpcClient.layerTest({
        exercise: { list: () => [BENCH_PRESS_EXERCISE] },
        routine: { list: () => [] },
        workout: { save: () => undefined },
      }),
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storedWorkoutDocumentJsons,
      ),
    });

    await user.press(screen.getByRole("button", { name: "Add set" }));

    await jest.advanceTimersByTimeAsync(2_000);

    await waitFor(() => {
      expect(
        readStoredWorkoutDocuments(storedWorkoutDocumentJsons),
      ).toMatchObject([{ workoutDocument: { syncedVersion: 2, version: 2 } }]);
    });
  });

  it("doesn't Save the Workout before 2 seconds have passed since the person changed it", async () => {
    const storedWorkoutDocumentJsons = storeWorkoutDocument(
      PUSH_DAY_WORKOUT_DOCUMENT,
    );
    const user = await openWorkoutScreen({
      trpcClientLayer: TrpcClient.layerTest({
        exercise: { list: () => [BENCH_PRESS_EXERCISE] },
        routine: { list: () => [] },
        workout: { save: () => undefined },
      }),
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storedWorkoutDocumentJsons,
      ),
    });

    await user.press(screen.getByRole("button", { name: "Add set" }));

    await jest.advanceTimersByTimeAsync(1_999);

    expect(
      readStoredWorkoutDocuments(storedWorkoutDocumentJsons),
    ).toMatchObject([{ workoutDocument: { syncedVersion: 1, version: 2 } }]);
  });

  it("Saves the Workout again after the server fails the first Save with an internal error", async () => {
    const workoutSaveResponses = [
      () => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      },
      () => undefined,
    ];
    const storedWorkoutDocumentJsons = storeWorkoutDocument(
      PUSH_DAY_WORKOUT_DOCUMENT,
    );
    const user = await openWorkoutScreen({
      trpcClientLayer: TrpcClient.layerTest({
        exercise: { list: () => [BENCH_PRESS_EXERCISE] },
        routine: { list: () => [] },
        workout: { save: () => workoutSaveResponses.shift()?.() },
      }),
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storedWorkoutDocumentJsons,
      ),
    });

    await user.press(screen.getByRole("button", { name: "Add set" }));

    await jest.advanceTimersByTimeAsync(3_000);

    await waitFor(() => {
      expect(
        readStoredWorkoutDocuments(storedWorkoutDocumentJsons),
      ).toMatchObject([{ workoutDocument: { syncedVersion: 2, version: 2 } }]);
    });
  });

  it("tells the person on the home screen that a Workout couldn't be saved when the server rejects its Save with a conflict", async () => {
    const user = await openWorkoutScreen({
      trpcClientLayer: TrpcClient.layerTest({
        exercise: { list: () => [BENCH_PRESS_EXERCISE] },
        routine: { list: () => [] },
        workout: {
          save: () => {
            throw new TRPCError({ code: "CONFLICT" });
          },
        },
      }),
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storeWorkoutDocument(PUSH_DAY_WORKOUT_DOCUMENT),
      ),
    });

    await user.press(screen.getByRole("button", { name: "Stop workout" }));

    await jest.advanceTimersByTimeAsync(2_000);

    expect(
      await screen.findByText(
        "A workout couldn't be saved: it stays on this device, and the app sends it again the next time you open it.",
      ),
    ).toBeOnTheScreen();
  });

  it("counts the time elapsed since the Workout started up as time passes", async () => {
    await openWorkoutScreen({
      trpcClientLayer: TRPC_CLIENT_LAYER,
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storeWorkoutDocument(PUSH_DAY_WORKOUT_DOCUMENT),
      ),
    });

    await jest.advanceTimersByTimeAsync(60_000);

    expect(screen.getByText("Elapsed time: 0:06:00")).toBeOnTheScreen();
  });

  it("asks the person why they skipped an exercise once they choose a reason", async () => {
    await openWorkoutScreen({
      trpcClientLayer: TRPC_CLIENT_LAYER,
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storeWorkoutDocument(PUSH_DAY_WORKOUT_DOCUMENT),
      ),
    });

    choosePickerFieldOption({ label: "Skipped", option: "low_on_time" });

    expect(
      await screen.findByLabelText("Why you skipped it"),
    ).toBeOnTheScreen();
  });

  it("Stores the reason the person chooses for skipping an exercise on the device", async () => {
    const storedWorkoutDocumentJsons = storeWorkoutDocument(
      PUSH_DAY_WORKOUT_DOCUMENT,
    );

    await openWorkoutScreen({
      trpcClientLayer: TRPC_CLIENT_LAYER,
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storedWorkoutDocumentJsons,
      ),
    });

    choosePickerFieldOption({ label: "Skipped", option: "low_on_time" });

    await waitFor(() => {
      expect(
        readStoredWorkoutDocuments(storedWorkoutDocumentJsons),
      ).toMatchObject([
        {
          _tag: "StoredWorkoutDocumentParsed",
          workoutDocument: { exercises: [{ skipReason: "low_on_time" }] },
        },
      ]);
    });
  });

  it("counts the Rest down as time passes", async () => {
    const user = await openWorkoutScreen({
      trpcClientLayer: TRPC_CLIENT_LAYER,
      workoutDocumentStorageLayer: WorkoutDocumentStorage.layerTest(
        storeWorkoutDocument(PUSH_DAY_WORKOUT_DOCUMENT),
      ),
    });

    await user.press(screen.getByRole("button", { name: "Start rest" }));

    await screen.findByText("Rest: 120 seconds left.");

    await jest.advanceTimersByTimeAsync(30_000);

    expect(screen.getByText("Rest: 90 seconds left.")).toBeOnTheScreen();
  });
});

async function openWorkoutScreen(testRuntimeLayers: TestRuntimeLayers) {
  const user = userEvent.setup();

  renderScreen({
    initialUrl: "/",
    testRuntimeLayers: {
      authenticationClientLayer: SIGNED_IN_AUTHENTICATION_CLIENT_LAYER,
      ...testRuntimeLayers,
    },
  });

  jest.setSystemTime(new Date("2026-10-19T09:05:00.000Z"));

  await user.press(await screen.findByRole("link", { name: "Resume workout" }));

  await screen.findByText("Bench Press (Barbell)");

  return user;
}

function readStoredWorkoutDocuments(
  storedWorkoutDocumentJsons: Map<string, string>,
) {
  return [...storedWorkoutDocumentJsons.values()].map((workoutDocumentJson) =>
    parseStoredWorkoutDocument(workoutDocumentJson),
  );
}

function storeWorkoutDocument(workoutDocument: WorkoutDocument) {
  return new Map([[workoutDocument.id, JSON.stringify(workoutDocument)]]);
}
