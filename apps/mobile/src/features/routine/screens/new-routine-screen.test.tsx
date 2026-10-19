import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { screen, userEvent, waitFor } from "@testing-library/react-native";

import type { Exercise } from "@/shared/interactors/list-exercises";
import type { Routine } from "@/shared/interactors/list-routines";
import type { TrpcTestResponses } from "@/shared/services/trpc-client";

import { AuthenticationClient } from "@/shared/services/authentication-client";
import { TrpcClient } from "@/shared/services/trpc-client";
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

const PUSH_DAY_ROUTINE: Routine = {
  days: [],
  exercises: [],
  id: "00000000-0000-7000-8000-000000000001",
  name: "Push day",
};

describe("NewRoutineScreen", () => {
  it("shows that the name is empty when the person Saves a Routine without a name", async () => {
    const user = await openNewRoutineScreen({
      exercise: { list: () => [BENCH_PRESS_EXERCISE] },
      routine: { list: () => [] },
    });

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByText("This routine has no name: enter a name."),
    ).toBeOnTheScreen();
  });

  it("Saves the Routine that the person builds", async () => {
    const savedRoutineSaveInputs: RoutineSaveInput[] = [];
    const user = await openNewRoutineScreen({
      exercise: { list: () => [BENCH_PRESS_EXERCISE] },
      routine: {
        list: () => [],
        save: (routineSaveInput) => {
          savedRoutineSaveInputs.push(routineSaveInput);
        },
      },
    });

    await user.type(screen.getByLabelText("Name"), "Push day");

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    await waitFor(() => {
      expect(savedRoutineSaveInputs).toEqual([
        {
          days: [],
          exercises: [],
          id: "00000000-0000-7000-8000-000000000001",
          name: "Push day",
        },
      ]);
    });
  });

  it("takes the person back to the home screen, which lists the Routine they Saved", async () => {
    const savedRoutines: Routine[] = [];
    const user = await openNewRoutineScreen({
      exercise: { list: () => [BENCH_PRESS_EXERCISE] },
      routine: {
        list: () => savedRoutines,
        save: () => {
          savedRoutines.push(PUSH_DAY_ROUTINE);
        },
      },
    });

    await user.type(screen.getByLabelText("Name"), "Push day");

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByRole("link", { name: "Push day" }),
    ).toBeOnTheScreen();
  });
});

async function openNewRoutineScreen(trpcTestResponses: TrpcTestResponses) {
  const user = userEvent.setup();

  renderScreen({
    initialUrl: "/",
    testRuntimeLayers: {
      authenticationClientLayer: AuthenticationClient.layerTest({
        "/get-session": () => Response.json(signedInSession),
      }),
      trpcClientLayer: TrpcClient.layerTest(trpcTestResponses),
    },
  });

  await user.press(await screen.findByRole("link", { name: "New routine" }));

  await screen.findByLabelText("Name");

  return user;
}
