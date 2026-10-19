import { screen, waitFor } from "@testing-library/react-native";
import { TRPCError } from "@trpc/server";

import type { Exercise } from "@/shared/interactors/list-exercises";
import type { Routine } from "@/shared/interactors/list-routines";

import { Accessibility } from "@/shared/services/accessibility";
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

const SIGNED_IN_AUTHENTICATION_CLIENT_LAYER = AuthenticationClient.layerTest({
  "/get-session": () => Response.json(signedInSession),
});

describe("HomeScreen", () => {
  it("shows each Routine that the server returns", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClientLayer: SIGNED_IN_AUTHENTICATION_CLIENT_LAYER,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [BENCH_PRESS_EXERCISE] },
          routine: { list: () => [PUSH_DAY_ROUTINE] },
        }),
      },
    });

    expect(
      await screen.findByRole("link", { name: "Push day" }),
    ).toBeOnTheScreen();
  });

  it("tells the person that they have no Routines when the server returns none", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClientLayer: SIGNED_IN_AUTHENTICATION_CLIENT_LAYER,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [BENCH_PRESS_EXERCISE] },
          routine: { list: () => [] },
        }),
      },
    });

    expect(
      await screen.findByText("You have no routines yet."),
    ).toBeOnTheScreen();
  });

  it("shows an error message when the server fails to list the Routines", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClientLayer: SIGNED_IN_AUTHENTICATION_CLIENT_LAYER,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [BENCH_PRESS_EXERCISE] },
          routine: {
            list: () => {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            },
          },
        }),
      },
    });

    expect(
      await screen.findByText("Something went wrong: try again."),
    ).toBeOnTheScreen();
  });

  it("announces the error message when the server fails to list the Routines", async () => {
    const announcedMessages: string[] = [];

    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        accessibilityLayer: Accessibility.layerTest(announcedMessages),
        authenticationClientLayer: SIGNED_IN_AUTHENTICATION_CLIENT_LAYER,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [BENCH_PRESS_EXERCISE] },
          routine: {
            list: () => {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            },
          },
        }),
      },
    });

    await waitFor(() => {
      expect(announcedMessages).toEqual(["Something went wrong: try again."]);
    });
  });
});
