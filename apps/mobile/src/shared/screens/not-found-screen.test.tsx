import { screen, userEvent } from "@testing-library/react-native";

import { renderScreen } from "@/shared/testing/render-screen";
import { signedInAuthenticationClientLayer } from "@/shared/testing/signed-in-authentication-client-layer";

describe("NotFoundScreen", () => {
  it("tells the person that the screen they opened doesn't exist", async () => {
    renderScreen({ initialUrl: "/screen-that-does-not-exist" });

    expect(
      await screen.findByText("This screen doesn't exist."),
    ).toBeOnTheScreen();
  });

  it("takes the person to the home screen when they press the button to go home", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/screen-that-does-not-exist",
      testRuntimeLayers: {
        authenticationClientLayer: signedInAuthenticationClientLayer,
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
