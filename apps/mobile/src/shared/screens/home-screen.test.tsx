import { screen, userEvent } from "@testing-library/react-native";

import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";
import { pushDayRoutine } from "#/shared/testing/push-day-routine.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

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
      },
    });

    await user.press(await screen.findByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
  });
});
