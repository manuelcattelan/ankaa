import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { TRPCError } from "@trpc/server";

import { Accessibility } from "@/shared/services/accessibility";
import { AuthenticationClient } from "@/shared/services/authentication-client";
import { TrpcClient } from "@/shared/services/trpc-client";
import { benchPressExercise } from "@/shared/testing/bench-press-exercise";
import { emptyHomeScreenTrpcClientLayer } from "@/shared/testing/empty-home-screen-trpc-client-layer";
import { pushDayRoutine } from "@/shared/testing/push-day-routine";
import { renderScreen } from "@/shared/testing/render-screen";
import { signedInAuthenticationClientLayer } from "@/shared/testing/signed-in-authentication-client-layer";
import { signedInSession } from "@/shared/testing/signed-in-session";

describe("HomeScreen", () => {
  it("shows each Routine that the server returns", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClientLayer: signedInAuthenticationClientLayer,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [benchPressExercise] },
          routine: { list: () => [pushDayRoutine] },
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
        authenticationClientLayer: signedInAuthenticationClientLayer,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [benchPressExercise] },
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
        authenticationClientLayer: signedInAuthenticationClientLayer,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [benchPressExercise] },
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
        authenticationClientLayer: signedInAuthenticationClientLayer,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [benchPressExercise] },
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

  it("opens the Workout screen with the Sets that the Routine plans when the person starts a Workout from it", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClientLayer: signedInAuthenticationClientLayer,
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [benchPressExercise] },
          routine: { list: () => [pushDayRoutine] },
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", {
        disabled: false,
        name: "Start Push day",
      }),
    );

    expect(
      await screen.findByText("0 working sets done, 1 left."),
    ).toBeOnTheScreen();
  });

  it("takes the person to the sign-in screen when they sign out", async () => {
    const user = userEvent.setup();
    let currentSession: null | typeof signedInSession = signedInSession;

    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest({
          "/get-session": () => Response.json(currentSession),
          "/sign-out": () => {
            currentSession = null;

            return Response.json({ success: true });
          },
        }),
        trpcClientLayer: emptyHomeScreenTrpcClientLayer,
      },
    });

    await user.press(await screen.findByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
  });
});
