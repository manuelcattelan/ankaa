import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { TRPCError } from "@trpc/server";

import type { TrpcTestResponses } from "@/shared/services/trpc-client";

import { TrpcClient } from "@/shared/services/trpc-client";
import { benchPressExercise } from "@/shared/testing/bench-press-exercise";
import { pushDayRoutine } from "@/shared/testing/push-day-routine";
import { renderScreen } from "@/shared/testing/render-screen";
import { signedInAuthenticationClientLayer } from "@/shared/testing/signed-in-authentication-client-layer";

describe("EditRoutineScreen", () => {
  it("Saves the changes that the person makes to the Routine", async () => {
    const savedRoutineSaveInputs: RoutineSaveInput[] = [];
    const user = await openEditRoutineScreen({
      exercise: { list: () => [benchPressExercise] },
      routine: {
        list: () => [pushDayRoutine],
        save: (routineSaveInput) => {
          savedRoutineSaveInputs.push(routineSaveInput);
        },
      },
    });

    await user.clear(screen.getByLabelText("Name"));

    await user.type(screen.getByLabelText("Name"), "Upper push");

    await user.clear(screen.getByLabelText("Repetitions or seconds"));

    await user.type(screen.getByLabelText("Repetitions or seconds"), "10");

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    await waitFor(() => {
      expect(savedRoutineSaveInputs).toEqual([
        {
          days: ["monday"],
          exercises: [
            {
              exerciseId: "01900000-0000-7000-8000-000000000001",
              id: "01900000-0000-7000-8000-000000000002",
              note: null,
              position: 0,
              section: "main",
              sets: [
                {
                  amount: 10,
                  dropSetSegmentCount: null,
                  dropSetWeightPercentage: null,
                  id: "01900000-0000-7000-8000-000000000003",
                  isToFailure: false,
                  position: 0,
                  restPauseRestSeconds: null,
                  restPauseSegmentCount: null,
                  restSeconds: 120,
                  setType: "working",
                  tempo: null,
                  variation: null,
                },
              ],
              superset: null,
              warmUpForRoutineExerciseId: null,
            },
          ],
          id: "01900000-0000-7000-8000-000000000004",
          name: "Upper push",
        },
      ]);
    });
  });

  it("shows that the name is taken when the server rejects the Save because another Routine has it", async () => {
    const user = await openEditRoutineScreen({
      exercise: { list: () => [benchPressExercise] },
      routine: {
        list: () => [pushDayRoutine],
        save: () => {
          throw new TRPCError({ code: "CONFLICT" });
        },
      },
    });

    await user.press(screen.getByRole("button", { name: "Save routine" }));

    expect(
      await screen.findByText(
        "You already have a routine with this name: enter another name.",
      ),
    ).toBeOnTheScreen();
  });

  it("deletes the Routine and takes the person back to the home screen, which no longer lists it", async () => {
    let listedRoutines = [pushDayRoutine];
    const user = await openEditRoutineScreen({
      exercise: { list: () => [benchPressExercise] },
      routine: {
        delete: () => {
          listedRoutines = [];
        },
        list: () => listedRoutines,
      },
    });

    await user.press(screen.getByRole("button", { name: "Delete routine" }));

    expect(
      await screen.findByText("You have no routines yet."),
    ).toBeOnTheScreen();
  });
});

async function openEditRoutineScreen(trpcTestResponses: TrpcTestResponses) {
  const user = userEvent.setup();

  renderScreen({
    initialUrl: "/",
    testRuntimeLayers: {
      authenticationClientLayer: signedInAuthenticationClientLayer,
      trpcClientLayer: TrpcClient.layerTest(trpcTestResponses),
    },
  });

  await user.press(await screen.findByRole("link", { name: "Push day" }));

  await screen.findByLabelText("Name");

  return user;
}
