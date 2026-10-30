import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { TRPCError } from "@trpc/server";

import type { Routine } from "#/shared/routine.ts";

import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { PUSH_DAY_ROUTINE } from "#/shared/testing/push-day-routine.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

describe("RoutineScreen", () => {
  it("opens the Routine of a link to it for a signed-in User, not the home screen", async () => {
    renderScreen({
      initialUrl: `/routines/${PUSH_DAY_ROUTINE.id}`,
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => [],
            "routine.list": () => [PUSH_DAY_ROUTINE],
          },
        }),
      },
    });

    expect(
      await screen.findByRole("button", { name: "Delete routine" }),
    ).toBeOnTheScreen();
  });

  it("Saves the edits that the User makes to the Routine, keeping its ids", async () => {
    const user = userEvent.setup();
    const savedInputs: RoutineSaveInput[] = [];
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "exercise.list": () => [],
            "routine.list": () => [PUSH_DAY_ROUTINE],
            "routine.save": (input) => {
              savedInputs.push(input);
            },
          },
        }),
      },
    });

    await user.press(await screen.findByRole("link", { name: "Push day" }));
    await user.clear(await screen.findByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Upper body");
    await user.clear(screen.getByLabelText("Repetitions or seconds"));
    await user.type(screen.getByLabelText("Repetitions or seconds"), "10");
    await user.press(screen.getByRole("button", { name: "Save routine" }));

    await waitFor(() => {
      expect(savedInputs).toStrictEqual([
        {
          days: ["monday"],
          id: "01900000-0000-7000-8000-000000000004",
          name: "Upper body",
          sections: {
            coolDown: [],
            main: [
              {
                exercises: [
                  {
                    exerciseId: "01900000-0000-7000-8000-000000000001",
                    id: "01900000-0000-7000-8000-000000000002",
                    note: null,
                    sets: [
                      {
                        amount: 10,
                        id: "01900000-0000-7000-8000-000000000003",
                        intensityTechnique: null,
                        isToFailure: false,
                        restSeconds: 120,
                        tempo: null,
                        type: "working",
                      },
                    ],
                    warmUpExercises: [],
                  },
                ],
                id: "01900000-0000-7000-8000-000000000005",
              },
            ],
            warmUp: [],
          },
        },
      ]);
    });
  });

  it("takes the User back to their Routines, without the Routine, once they delete it", async () => {
    const user = userEvent.setup();
    let routines: Routine[] = [PUSH_DAY_ROUTINE];
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.delete": (input) => {
              routines = routines.filter((routine) => routine.id !== input.id);
            },
            "routine.list": () => routines,
          },
        }),
      },
    });

    await user.press(await screen.findByRole("link", { name: "Push day" }));
    await user.press(
      await screen.findByRole("button", { name: "Delete routine" }),
    );

    expect(
      await screen.findByText("You have no routines yet."),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole("link", { name: "Push day" }),
    ).not.toBeOnTheScreen();
  });

  it("tells the User that the Routine doesn't exist anymore when the server fails with RoutineNotFoundError", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.delete": () => {
              throw new RoutineNotFoundError();
            },
            "routine.list": () => [PUSH_DAY_ROUTINE],
          },
        }),
      },
    });

    await user.press(await screen.findByRole("link", { name: "Push day" }));
    await user.press(
      await screen.findByRole("button", { name: "Delete routine" }),
    );

    expect(
      await screen.findByText(
        "This routine doesn't exist anymore: go back to your routines.",
      ),
    ).toBeOnTheScreen();
  });

  it("takes the User to the sign-in screen when the server rejects the delete as unauthorized because it revoked their session", async () => {
    const user = userEvent.setup();
    let currentSession: null | typeof signedInSession = signedInSession;
    renderScreen({
      initialUrl: "/",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/get-session": () => Response.json(currentSession),
        }),
        trpcClient: fakeTrpcClientLayer({
          responses: {
            "routine.delete": () => {
              currentSession = null;

              throw new TRPCError({ code: "UNAUTHORIZED" });
            },
            "routine.list": () => [PUSH_DAY_ROUTINE],
          },
        }),
      },
    });

    await user.press(await screen.findByRole("link", { name: "Push day" }));
    await user.press(
      await screen.findByRole("button", { name: "Delete routine" }),
    );

    expect(
      await screen.findByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
  });
});
