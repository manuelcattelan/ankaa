import { screen, userEvent } from "@testing-library/react-native";

import { fakeSignedInAuthenticationClientLayer } from "#/shared/testing/fake-signed-in-authentication-client-layer.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

describe("NotFoundScreen", () => {
  it("tells the User that the screen they opened doesn't exist", async () => {
    renderScreen({ initialUrl: "/screen-that-does-not-exist" });

    expect(
      await screen.findByText("This screen doesn't exist."),
    ).toBeOnTheScreen();
  });

  it("takes the User to the home screen when they press the button to go home", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/screen-that-does-not-exist",
      testRuntimeLayers: {
        authenticationClient: fakeSignedInAuthenticationClientLayer,
      },
    });

    await user.press(
      await screen.findByRole("link", { name: "Go to home screen" }),
    );

    expect(
      await screen.findByRole("button", { name: "Sign out" }),
    ).toBeOnTheScreen();
  });
});
