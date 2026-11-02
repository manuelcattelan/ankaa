import type { AbsenceRecordInput } from "@ankaa/core/features/absence/schemas/absence-record-input-schema";
import type { WorkoutStartInput } from "@ankaa/core/features/workout/schemas/workout-start-input-schema";

import { AbsenceDateConflictError } from "@ankaa/core/features/absence/errors/absence-date-conflict-error";
import { AbsenceDateInFutureError } from "@ankaa/core/features/absence/errors/absence-date-in-future-error";
import { WorkoutInProgressConflictError } from "@ankaa/core/features/workout/errors/workout-in-progress-conflict-error";
import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import * as DateTime from "effect/DateTime";

import type { Exercise } from "#/shared/exercise.ts";
import type { Workout } from "#/shared/workout.ts";

import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { PUSH_DAY_ROUTINE } from "#/shared/testing/push-day-routine.ts";
import { PUSH_DAY_WORKOUT } from "#/shared/testing/push-day-workout.ts";
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

const SYDNEY_TIME_ZONE_LAYER = DateTime.layerCurrentZone(
  DateTime.zoneMakeNamedUnsafe("Australia/Sydney"),
);

/**
 * Opens the form that records an Absence of Push day, and picks pain as its
 * reason, which every Absence needs.
 */
async function openAbsenceRecordForm({
  user,
}: {
  user: ReturnType<typeof userEvent.setup>;
}) {
  await user.press(
    await screen.findByRole("button", {
      name: "Record absence from Push day",
    }),
  );
  fireEvent(screen.getByTestId("Why you couldn't train"), "selectionChange", {
    nativeEvent: { selection: "pain" },
  });
}

describe("HomeScreen", () => {
  it("lists each Routine of the User", async () => {
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: { "routine.list": () => [PUSH_DAY_ROUTINE] },
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
            "routine.list": () => [PUSH_DAY_ROUTINE],
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
            "routine.list": () => [PUSH_DAY_ROUTINE],
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
            "routine.list": () => [PUSH_DAY_ROUTINE],
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
            "routine.list": () => [PUSH_DAY_ROUTINE],
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

  it("disables Delete account, and shows it busy, while the request to delete the Account waits for its answer", async () => {
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
    expect(screen.getByRole("button", { name: "Delete account" })).toBeBusy();
  });

  it("tells the User to check their email once the server answers the request to delete the Account", async () => {
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

    deleteUserResponse.resolve(
      Response.json({ message: "Verification email sent", success: true }),
    );

    expect(
      await screen.findByText(
        "Check your email to confirm deleting your account.",
      ),
    ).toBeOnTheScreen();
  });

  it("enables Delete account again once the server answers the request to delete the Account", async () => {
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

    deleteUserResponse.resolve(
      Response.json({ message: "Verification email sent", success: true }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Delete account" }),
      ).toBeEnabled();
    });
    expect(
      screen.getByRole("button", { name: "Delete account" }),
    ).not.toBeBusy();
  });

  it("offers each Routine an Absence next to its start, also while a Workout is in progress, with today's date selected", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        currentTimeZone: SYDNEY_TIME_ZONE_LAYER,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "workout.findInProgress": () => PUSH_DAY_WORKOUT,
          },
        }),
      },
    });
    jest.setSystemTime(new Date("2026-11-01T20:00:00.000Z"));

    await user.press(
      await screen.findByRole("button", {
        name: "Record absence from Push day",
      }),
    );

    expect(screen.getByTestId("Day you couldn't train")).toHaveProp(
      "selection",
      expect.stringMatching(/^2026-11-01T20:00:00/),
    );
  });

  it("records an Absence with the Routine, the day picked where the device is, the reason, the note and the device's time zone", async () => {
    const recordedInputs: AbsenceRecordInput[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        currentTimeZone: SYDNEY_TIME_ZONE_LAYER,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "absence.record": (input) => {
              recordedInputs.push(input);
            },
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "workout.findInProgress": () => null,
          },
        }),
      },
    });
    jest.setSystemTime(new Date("2026-11-01T20:00:00.000Z"));
    await openAbsenceRecordForm({ user });
    fireEvent(screen.getByTestId("Day you couldn't train"), "dateChange", {
      nativeEvent: { date: "2026-10-29T14:00:00.000Z" },
    });
    await user.type(screen.getByLabelText("Note"), "Sore shoulder");

    await user.press(screen.getByRole("button", { name: "Record absence" }));

    expect(
      await screen.findByText("You recorded that you couldn't do Push day."),
    ).toBeOnTheScreen();
    expect(recordedInputs).toStrictEqual([
      {
        date: "2026-10-30",
        note: "Sore shoulder",
        reason: "pain",
        routineId: "01900000-0000-7000-8000-000000000004",
        timeZone: DateTime.zoneMakeNamedUnsafe("Australia/Sydney"),
      },
    ]);
  });

  it("refuses to record an Absence on a day after today where the device is, and sends nothing", async () => {
    const receivedPaths: string[] = [];
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        currentTimeZone: SYDNEY_TIME_ZONE_LAYER,
        trpcClient: fakeTrpcClientLayer({
          receivedPaths,
          responses: {
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "workout.findInProgress": () => null,
          },
        }),
      },
    });
    jest.setSystemTime(new Date("2026-11-01T20:00:00.000Z"));
    await openAbsenceRecordForm({ user });
    fireEvent(screen.getByTestId("Day you couldn't train"), "dateChange", {
      nativeEvent: { date: "2026-11-02T14:00:00.000Z" },
    });

    await user.press(screen.getByRole("button", { name: "Record absence" }));

    expect(
      await screen.findByText(
        "This day hasn't come yet: pick today or a day before it.",
      ),
    ).toBeOnTheScreen();
    expect(receivedPaths).not.toContain("absence.record");
  });

  it("tells the User that they already recorded an Absence when the Routine has one on that day", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "absence.record": () => {
              throw new AbsenceDateConflictError();
            },
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "workout.findInProgress": () => null,
          },
        }),
      },
    });
    await openAbsenceRecordForm({ user });

    await user.press(screen.getByRole("button", { name: "Record absence" }));

    expect(
      await screen.findByText(
        "You already recorded that you couldn't do this routine on this day.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User that the day hasn't come yet when the server finds the day in the future", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "absence.record": () => {
              throw new AbsenceDateInFutureError();
            },
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "workout.findInProgress": () => null,
          },
        }),
      },
    });
    await openAbsenceRecordForm({ user });

    await user.press(screen.getByRole("button", { name: "Record absence" }));

    expect(
      await screen.findByText(
        "This day hasn't come yet where you are: pick today or a day before it.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User that the Routine doesn't exist anymore when the server can't find it", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "absence.record": () => {
              throw new RoutineNotFoundError();
            },
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "workout.findInProgress": () => null,
          },
        }),
      },
    });
    await openAbsenceRecordForm({ user });

    await user.press(screen.getByRole("button", { name: "Record absence" }));

    expect(
      await screen.findByText(
        "This routine doesn't exist anymore: pick another routine.",
      ),
    ).toBeOnTheScreen();
  });
});
