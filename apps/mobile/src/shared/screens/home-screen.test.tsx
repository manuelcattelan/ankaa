import { screen, userEvent } from "@testing-library/react-native";

import { fakeGoogleSignInLayer } from "#/features/authentication/testing/fake-google-sign-in-layer.ts";
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
});
