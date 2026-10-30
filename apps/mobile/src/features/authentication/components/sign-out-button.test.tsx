import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";

import { screen, userEvent } from "@testing-library/react-native";

import type { ScheduledNotification } from "#/shared/services/notifications.ts";

import { fakeGoogleSignInLayer } from "#/features/authentication/testing/fake-google-sign-in-layer.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeNotificationsLayer } from "#/shared/testing/fake-notifications-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { PUSH_DAY_ROUTINE } from "#/shared/testing/push-day-routine.ts";
import { PUSH_DAY_WORKOUT } from "#/shared/testing/push-day-workout.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

describe("SignOutButton", () => {
  it("takes the User to the sign-in screen when they sign out", async () => {
    const user = userEvent.setup();
    let currentSession: null | typeof signedInSession = signedInSession;

    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/get-session": () => Response.json(currentSession),
          "/sign-out": () => {
            currentSession = null;

            return Response.json({ success: true });
          },
        }),
        googleSignIn: fakeGoogleSignInLayer({}),
      },
    });

    await user.press(await screen.findByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
  });

  it("signs the User out of Google too when they sign out, so they can choose another Google account", async () => {
    const googleSignInCalls: string[] = [];
    const user = userEvent.setup();
    let currentSession: null | typeof signedInSession = signedInSession;
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/get-session": () => Response.json(currentSession),
          "/sign-out": () => {
            currentSession = null;

            return Response.json({ success: true });
          },
        }),
        googleSignIn: fakeGoogleSignInLayer({
          receivedCalls: googleSignInCalls,
        }),
      },
    });

    await user.press(await screen.findByRole("button", { name: "Sign out" }));

    await screen.findByRole("link", { name: "Continue with email address" });

    expect(googleSignInCalls).toStrictEqual(["signOut"]);
  });

  it("cancels the scheduled notification of a countdown when the User signs out, and leaves their Workout in progress", async () => {
    const scheduledNotifications: ScheduledNotification[] = [
      {
        body: "Start your next set.",
        seconds: 120,
        title: "Your rest is over",
      },
    ];
    const stoppedInputs: WorkoutStopInput[] = [];
    const user = userEvent.setup();
    let currentSession: null | typeof signedInSession = signedInSession;
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/get-session": () => Response.json(currentSession),
          "/sign-out": () => {
            currentSession = null;

            return Response.json({ success: true });
          },
        }),
        googleSignIn: fakeGoogleSignInLayer({}),
        notifications: fakeNotificationsLayer({ scheduledNotifications }),
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "workout.findInProgress": () => PUSH_DAY_WORKOUT,
            "workout.stop": (input) => {
              stoppedInputs.push(input);
            },
          },
        }),
      },
    });
    await screen.findByRole("link", { name: "Resume workout" });

    await user.press(screen.getByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
    expect(scheduledNotifications).toStrictEqual([]);
    expect(stoppedInputs).toStrictEqual([]);
  });
});
