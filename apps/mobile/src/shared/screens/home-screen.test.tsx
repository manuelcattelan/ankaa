import { screen, userEvent } from "@testing-library/react-native";

import { AuthenticationClient } from "@/shared/services/authentication-client";
import { renderScreen } from "@/shared/testing/render-screen";
import { signedInSession } from "@/shared/testing/signed-in-session";

describe("HomeScreen", () => {
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
      },
    });

    await user.press(await screen.findByRole("button", { name: "Sign out" }));

    expect(
      await screen.findByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
  });
});
