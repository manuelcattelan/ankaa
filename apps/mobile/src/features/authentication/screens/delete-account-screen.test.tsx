import { fireEvent, screen } from "@testing-library/react-native";
import * as ExpoAppleAuthentication from "expo-apple-authentication";

import { fakeAppleSignInLayer } from "#/features/authentication/testing/fake-apple-sign-in-layer.ts";
import { fakeGoogleSignInLayer } from "#/features/authentication/testing/fake-google-sign-in-layer.ts";
import { advanceFakeTime } from "#/shared/testing/advance-fake-time.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";
import { renderScreen } from "#/testing/render-screen.tsx";

const APPLE_AUTHENTICATION_CREDENTIAL: ExpoAppleAuthentication.AppleAuthenticationCredential =
  {
    authorizationCode: null,
    email: null,
    fullName: null,
    identityToken: "apple-identity-token",
    realUserStatus:
      ExpoAppleAuthentication.AppleAuthenticationUserDetectionStatus
        .LIKELY_REAL,
    ["state"]: null,
    user: "apple-user-1",
  };

describe("DeleteAccountScreen", () => {
  it("deletes the Account of the link's token, signs the User out, and tells them on the sign-in screen that their account has been deleted", async () => {
    const authenticationRequests: unknown[] = [];
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
            currentSession = null;

            return Response.json({ message: "User deleted", success: true });
          },
          "/get-session": () => Response.json(currentSession),
          "/sign-out": () => {
            authenticationRequests.push({ path: "/sign-out" });

            return Response.json({ success: true });
          },
        }),
        googleSignIn: fakeGoogleSignInLayer({}),
      },
    });

    expect(
      await screen.findByText("Your account has been deleted."),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("link", { name: "Continue with email address" }),
    ).toBeOnTheScreen();
    expect(authenticationRequests).toStrictEqual([
      { body: `{"token":"deletion-token-1"}`, path: "/delete-user" },
      { path: "/sign-out" },
    ]);
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
    const deleteUserRequestCount = { value: 0 };
    renderScreen({
      initialUrl: "/delete-account",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/delete-user": () => {
            deleteUserRequestCount.value += 1;

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
    expect(deleteUserRequestCount.value).toBe(0);
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

  it("sends a signed-out User to sign in first, and deletes the Account of the link's token only once they've signed in", async () => {
    const authenticationRequests: unknown[] = [];
    let currentSession: null | typeof signedInSession = null;
    renderScreen({
      initialUrl: "/delete-account?token=deletion-token-2",
      testRuntimeLayers: {
        appleSignIn: fakeAppleSignInLayer({
          appleAuthenticationCredential: APPLE_AUTHENTICATION_CREDENTIAL,
        }),
        authenticationClient: fakeAuthenticationClientLayer({
          "/delete-user": async (request) => {
            authenticationRequests.push({
              body: await request.text(),
              path: "/delete-user",
            });
            currentSession = null;

            return Response.json({ message: "User deleted", success: true });
          },
          "/get-session": () => Response.json(currentSession),
          "/sign-in/social": () => {
            authenticationRequests.push({ path: "/sign-in/social" });
            currentSession = signedInSession;

            return Response.json(
              {
                token: signedInSession.session.token,
                user: signedInSession.user,
              },
              {
                headers: {
                  "Set-Cookie": `better-auth.session_token=${signedInSession.session.token}; Path=/; HttpOnly`,
                },
              },
            );
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
    const appleSignInButton = await screen.findByTestId("apple-sign-in-button");
    await advanceFakeTime(1000);
    const authenticationRequestsBeforeSignIn = [...authenticationRequests];

    fireEvent.press(appleSignInButton);

    expect(
      await screen.findByText("Your account has been deleted."),
    ).toBeOnTheScreen();
    expect(authenticationRequestsBeforeSignIn).toStrictEqual([]);
    expect(authenticationRequests).toStrictEqual([
      { path: "/sign-in/social" },
      { body: `{"token":"deletion-token-2"}`, path: "/delete-user" },
      { path: "/sign-out" },
    ]);
  });
});
