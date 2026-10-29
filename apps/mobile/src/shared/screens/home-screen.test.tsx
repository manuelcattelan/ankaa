import { screen, userEvent } from "@testing-library/react-native";

import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

describe("HomeScreen", () => {
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
