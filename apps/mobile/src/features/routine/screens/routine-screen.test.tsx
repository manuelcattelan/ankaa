import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { screen, userEvent } from "@testing-library/react-native";
import { TRPCError } from "@trpc/server";

import type { Routine } from "#/shared/routine.ts";

import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { pushDayRoutine } from "#/shared/testing/push-day-routine.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

describe("RoutineScreen", () => {
  it("takes the User back to their Routines, without the Routine, once they delete it", async () => {
    const user = userEvent.setup();
    let routines: Routine[] = [pushDayRoutine];
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
            "routine.list": () => [pushDayRoutine],
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
            "routine.list": () => [pushDayRoutine],
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
