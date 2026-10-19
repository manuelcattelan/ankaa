import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { screen, userEvent, waitFor } from "@testing-library/react-native";

import type { Routine } from "@/shared/interactors/list-routines";
import type { TrpcTestResponses } from "@/shared/services/trpc-client";

import { TrpcClient } from "@/shared/services/trpc-client";
import { benchPressExercise } from "@/shared/testing/bench-press-exercise";
import { renderScreen } from "@/shared/testing/render-screen";
import { signedInAuthenticationClientLayer } from "@/shared/testing/signed-in-authentication-client-layer";

type OpenNewRoutineScreenOptions = {
  receivedTrpcPaths?: string[];
  trpcTestResponses: TrpcTestResponses;
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
      trpcTestResponses: {
        exercise: { list: () => [benchPressExercise] },
        routine: { list: () => [] },
      },
    });

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByText("This routine has no name: enter a name."),
    ).toBeOnTheScreen();
  });

  it("doesn't Save a Routine without a name", async () => {
    const receivedTrpcPaths: string[] = [];
    const user = await openNewRoutineScreen({
      receivedTrpcPaths,
      trpcTestResponses: {
        exercise: { list: () => [benchPressExercise] },
        routine: { list: () => [], save: () => undefined },
      },
    });

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    await screen.findByText("This routine has no name: enter a name.");

    expect(receivedTrpcPaths).not.toContain("routine.save");
  });

  it("Saves the Routine that the person builds", async () => {
    const savedRoutineSaveInputs: RoutineSaveInput[] = [];
    const user = await openNewRoutineScreen({
      trpcTestResponses: {
        exercise: { list: () => [benchPressExercise] },
        routine: {
          list: () => [],
          save: (routineSaveInput) => {
            savedRoutineSaveInputs.push(routineSaveInput);
          },
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
      trpcTestResponses: {
        exercise: { list: () => [benchPressExercise] },
        routine: {
          list: () => savedRoutines,
          save: () => {
            savedRoutines.push(PUSH_DAY_ROUTINE);
          },
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

async function openNewRoutineScreen({
  receivedTrpcPaths = [],
  trpcTestResponses,
}: OpenNewRoutineScreenOptions) {
  const user = userEvent.setup();

  renderScreen({
    initialUrl: "/",
    testRuntimeLayers: {
      authenticationClientLayer: signedInAuthenticationClientLayer,
      trpcClientLayer: TrpcClient.layerTest(
        trpcTestResponses,
        receivedTrpcPaths,
      ),
    },
  });

  await user.press(await screen.findByRole("link", { name: "New routine" }));

  await screen.findByLabelText("Name");

  return user;
}
