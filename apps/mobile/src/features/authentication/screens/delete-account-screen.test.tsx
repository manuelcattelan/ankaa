import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { APPLE_AUTHENTICATION_CREDENTIAL } from "#/features/authentication/testing/apple-authentication-credential.ts";
import { fakeAppleSignInLayer } from "#/features/authentication/testing/fake-apple-sign-in-layer.ts";
import { fakeGoogleSignInLayer } from "#/features/authentication/testing/fake-google-sign-in-layer.ts";
import { advanceFakeTime } from "#/shared/testing/advance-fake-time.ts";
import { createFakeSignInResponses } from "#/shared/testing/create-fake-sign-in-responses.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

/**
 * Renders the deletion link's screen for a User who is signed in until they
 * sign out, recording the path, and the body of a deletion, of each request
 * into `authenticationRequests`.
 */
function renderSignedInDeletion(authenticationRequests: unknown[]) {
  let currentSession: null | typeof signedInSession = signedInSession;

  renderScreen({
    initialUrl: "/delete-account?token=deletion-token-1",
    testRuntimeLayers: {
      authenticationClient: fakeAuthenticationClientLayer({
        "/delete-user": async (request) => {
          authenticationRequests.push({
            body: await request.text(),
            path: "/delete-user",
          });

          return Response.json({ message: "User deleted", success: true });
        },
        "/get-session": () => Response.json(currentSession),
        "/sign-out": () => {
          authenticationRequests.push({ path: "/sign-out" });
          currentSession = null;

          return Response.json({ success: true });
        },
      }),
      googleSignIn: fakeGoogleSignInLayer({}),
    },
  });
}

/**
 * Renders the deletion link's screen for a signed-out User, who can sign in
 * with Apple, recording each sign-in into `receivedSignInRequests`, and the
 * path, and the body of a deletion, of each later request into
 * `authenticationRequests`.
 */
function renderSignedOutDeletion({
  authenticationRequests,
  receivedSignInRequests,
}: {
  authenticationRequests: unknown[];
  receivedSignInRequests: Request[];
}) {
  renderScreen({
    initialUrl: "/delete-account?token=deletion-token-2",
    testRuntimeLayers: {
      appleSignIn: fakeAppleSignInLayer({
        appleAuthenticationCredential: APPLE_AUTHENTICATION_CREDENTIAL,
      }),
      authenticationClient: fakeAuthenticationClientLayer({
        ...createFakeSignInResponses({
          receivedSignInRequests,
          signInPath: "/sign-in/social",
        }),
        "/delete-user": async (request) => {
          authenticationRequests.push({
            body: await request.text(),
            path: "/delete-user",
          });

          return Response.json({ message: "User deleted", success: true });
        },
        "/sign-out": () => {
          authenticationRequests.push({ path: "/sign-out" });

          return Response.json({ success: true });
        },
      }),
      crypto: fakeCryptoLayer,
      googleSignIn: fakeGoogleSignInLayer({}),
    },
  });
}

describe("DeleteAccountScreen", () => {
  it("deletes the Account of the link's token, then signs the User out", async () => {
    const authenticationRequests: unknown[] = [];
    renderSignedInDeletion(authenticationRequests);

    await waitFor(() => {
      expect(authenticationRequests).toStrictEqual([
        { body: `{"token":"deletion-token-1"}`, path: "/delete-user" },
        { path: "/sign-out" },
      ]);
    });
  });

  it("tells the User on the sign-in screen that their account has been deleted", async () => {
    renderSignedInDeletion([]);

    expect(
      await screen.findByText("Your account has been deleted."),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
  });

  it("tells the User how to get a new link when the server rejects the link's token as expired, used or another User's", async () => {
    renderScreen({
      initialUrl: "/delete-account?token=deletion-token-3",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/delete-user": () =>
            Response.json(
              { code: "INVALID_TOKEN", message: "Invalid token" },
              { status: 404 },
            ),
          "/get-session": () => Response.json(signedInSession),
        }),
      },
    });

    expect(
      await screen.findByText(
        "This link has expired or was already used. Tap Delete account to get a new one.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User how to get a new link, and sends no deletion request that would email another one, when the link has no token", async () => {
    const deleteUserRequests: Request[] = [];
    renderScreen({
      initialUrl: "/delete-account",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/delete-user": (request) => {
            deleteUserRequests.push(request);

            return Response.json({
              message: "Verification email sent",
              success: true,
            });
          },
          "/get-session": () => Response.json(signedInSession),
        }),
      },
    });

    expect(
      await screen.findByText(
        "This link has expired or was already used. Tap Delete account to get a new one.",
      ),
    ).toBeOnTheScreen();
    expect(deleteUserRequests).toStrictEqual([]);
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", async () => {
    renderScreen({
      initialUrl: "/delete-account?token=deletion-token-4",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/delete-user": () => {
            throw new TypeError("Network request failed");
          },
          "/get-session": () => Response.json(signedInSession),
        }),
      },
    });

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
  });

  it("sends a signed-out User to sign in first, deleting nothing yet", async () => {
    const authenticationRequests: unknown[] = [];
    renderSignedOutDeletion({
      authenticationRequests,
      receivedSignInRequests: [],
    });

    await screen.findByTestId("apple-sign-in-button");
    await advanceFakeTime(1000);

    expect(authenticationRequests).toStrictEqual([]);
  });

  it("deletes the Account of the link's token once the signed-out User signs in", async () => {
    const authenticationRequests: unknown[] = [];
    const receivedSignInRequests: Request[] = [];
    renderSignedOutDeletion({ authenticationRequests, receivedSignInRequests });
    const appleSignInButton = await screen.findByTestId("apple-sign-in-button");

    fireEvent.press(appleSignInButton);

    await waitFor(() => {
      expect(authenticationRequests).toStrictEqual([
        { body: `{"token":"deletion-token-2"}`, path: "/delete-user" },
        { path: "/sign-out" },
      ]);
    });
    expect(receivedSignInRequests).toHaveLength(1);
  });
});
