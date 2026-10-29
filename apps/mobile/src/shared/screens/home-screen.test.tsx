import type { WorkoutStartInput } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";
import type { WorkoutStopInput } from "@ankaa/core/features/workout/schemas/workout-stop-input-schema";

import { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import { screen, userEvent } from "@testing-library/react-native";

import type { Workout } from "#/features/workout/workout-application-service.ts";
import type { Exercise } from "#/shared/exercise-application-service.ts";
import type { ScheduledNotification } from "#/shared/services/notifications.ts";

import { fakeGoogleSignInLayer } from "#/features/authentication/testing/fake-google-sign-in-layer.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
import { fakeNotificationsLayer } from "#/shared/testing/fake-notifications-layer.ts";
import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { pushDayRoutine } from "#/shared/testing/push-day-routine.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

const BENCH_PRESS_EXERCISE: Exercise = {
  amountUnit: "repetition",
  equipment: [{ equipment: "barbell" }, { equipment: "bench" }],
  id: "01900000-0000-7000-8000-000000000001",
  muscleGroups: [{ muscleGroup: "chest", role: "primary" }],
  name: "Bench Press (Barbell)",
  weightType: "total",
};

const PUSH_DAY_WORKOUT: Workout = {
  id: "01900000-0000-7000-8000-000000000101",
  sections: {
    coolDown: [],
    main: [
      {
        exercises: [
          {
            amountUnit: "repetition",
            exerciseId: "01900000-0000-7000-8000-000000000001",
            id: "01900000-0000-7000-8000-000000000102",
            note: null,
            plannedNote: null,
            plannedSets: [
              {
                amount: 8,
                id: "01900000-0000-7000-8000-000000000103",
                intensityTechnique: null,
                isToFailure: false,
                restSeconds: 120,
                tempo: null,
                type: "working",
              },
            ],
            recordedSets: [],
            skipReason: null,
            skipReasonNote: null,
            warmUpExercises: [],
            weightType: "total",
            weightUnit: "kilogram",
          },
        ],
        id: "01900000-0000-7000-8000-000000000104",
      },
    ],
    warmUp: [],
  },
};

describe("HomeScreen", () => {
  it("lists each Routine of the User", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: { "routine.list": () => [pushDayRoutine] },
        }),
      },
    });

    expect(
      await screen.findByRole("link", { name: "Push day" }),
    ).toBeOnTheScreen();
  });

  it("offers to resume the User's Workout in progress instead of starting a Workout from a Routine", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.list": () => [pushDayRoutine],
            "workout.findInProgress": () => PUSH_DAY_WORKOUT,
          },
        }),
      },
    });

    expect(
      await screen.findByRole("link", { name: "Resume workout" }),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: "Start Push day" }),
    ).not.toBeOnTheScreen();
  });

  it("starts a Workout from the Routine the User picks, with an id the app creates, and shows it", async () => {
    const startedInputs: WorkoutStartInput[] = [];
    let workoutInProgress: null | Workout = null;
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        crypto: fakeCryptoLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => [BENCH_PRESS_EXERCISE],
            "routine.list": () => [pushDayRoutine],
            "workout.findInProgress": () => workoutInProgress,
            "workout.start": (input) => {
              startedInputs.push(input);
              workoutInProgress = PUSH_DAY_WORKOUT;
            },
          },
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Start Push day" }),
    );

    expect(await screen.findByText("Bench Press (Barbell)")).toBeOnTheScreen();
    expect(startedInputs).toStrictEqual([
      {
        id: "00000000-0000-7000-8000-000000000001",
        routineId: "01900000-0000-7000-8000-000000000004",
      },
    ]);
  });

  it("tells the User that a Workout is already in progress when another device started one first, and offers to resume it", async () => {
    let workoutInProgress: null | Workout = null;
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        crypto: fakeCryptoLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.list": () => [pushDayRoutine],
            "workout.findInProgress": () => workoutInProgress,
            "workout.start": () => {
              workoutInProgress = PUSH_DAY_WORKOUT;

              throw new WorkoutInProgressConflictError();
            },
          },
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Start Push day" }),
    );

    expect(
      await screen.findByText(
        "You already have a workout in progress: resume it, or stop it before you start another.",
      ),
    ).toBeOnTheScreen();
    expect(
      await screen.findByRole("link", { name: "Resume workout" }),
    ).toBeOnTheScreen();
  });

  it("tells the User that Ankaa can't connect when a start can't reach the server, and keeps offering the start", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        crypto: fakeCryptoLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.list": () => [pushDayRoutine],
            "workout.findInProgress": () => null,
          },
          unreachablePaths: ["workout.start"],
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Start Push day" }),
    );

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Start Push day" }),
    ).toBeEnabled();
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({ isServerReachable: false }),
      },
    });

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
  });

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

  it("sends the request to delete the Account when the User taps Delete account, with the button disabled until it's answered, then tells them to check their email", async () => {
    const user = userEvent.setup();
    const deleteUserResponse = Promise.withResolvers<Response>();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/delete-user": () => deleteUserResponse.promise,
          "/get-session": () => Response.json(signedInSession),
        }),
      },
    });

    await user.press(
      await screen.findByRole("button", { name: "Delete account" }),
    );

    expect(
      screen.getByRole("button", { name: "Delete account" }),
    ).toBeDisabled();

    deleteUserResponse.resolve(
      Response.json({ message: "Verification email sent", success: true }),
    );

    expect(
      await screen.findByText(
        "Check your email to confirm deleting your account.",
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Delete account" }),
    ).toBeEnabled();
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
            "routine.list": () => [pushDayRoutine],
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
