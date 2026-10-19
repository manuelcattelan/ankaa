import { screen, userEvent } from "@testing-library/react-native";

import { AuthenticationClient } from "@/shared/services/authentication-client";
import { TrpcClient } from "@/shared/services/trpc-client";
import { renderScreen } from "@/shared/testing/render-screen";
import { signedInSession } from "@/shared/testing/signed-in-session";

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
        authenticationClientLayer: AuthenticationClient.layerTest({
          "/get-session": () => Response.json(signedInSession),
        }),
        trpcClientLayer: TrpcClient.layerTest({
          exercise: { list: () => [] },
          routine: { list: () => [] },
        }),
      },
    });

    await user.press(
      await screen.findByRole("link", { name: "Go to home screen" }),
    );

    expect(
      await screen.findByText("You have no routines yet."),
    ).toBeOnTheScreen();
  });
});
