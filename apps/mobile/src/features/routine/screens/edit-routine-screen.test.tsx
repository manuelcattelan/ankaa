import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { TRPCError } from "@trpc/server";

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
          amount: 8,
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
  name: "Push day",
};

describe("EditRoutineScreen", () => {
  it("Saves the changes that the person makes to the Routine", async () => {
    const savedRoutineSaveInputs: RoutineSaveInput[] = [];
    const user = await openEditRoutineScreen({
      exercise: { list: () => [BENCH_PRESS_EXERCISE] },
      routine: {
        list: () => [PUSH_DAY_ROUTINE],
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
      exercise: { list: () => [BENCH_PRESS_EXERCISE] },
      routine: {
        list: () => [PUSH_DAY_ROUTINE],
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
    let listedRoutines = [PUSH_DAY_ROUTINE];
    const user = await openEditRoutineScreen({
      exercise: { list: () => [BENCH_PRESS_EXERCISE] },
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
      authenticationClientLayer: AuthenticationClient.layerTest({
        "/get-session": () => Response.json(signedInSession),
      }),
      trpcClientLayer: TrpcClient.layerTest(trpcTestResponses),
    },
  });

  await user.press(await screen.findByRole("link", { name: "Push day" }));

  await screen.findByLabelText("Name");

  return user;
}
