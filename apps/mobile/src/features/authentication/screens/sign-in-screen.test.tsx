import type { SignInResponse } from "@react-native-google-signin/google-signin";

import { fireEvent, screen, userEvent } from "@testing-library/react-native";
import * as ExpoAppleAuthentication from "expo-apple-authentication";

import { fakeAppleSignInLayer } from "#/features/authentication/testing/fake-apple-sign-in-layer.ts";
import { fakeGoogleSignInLayer } from "#/features/authentication/testing/fake-google-sign-in-layer.ts";
import { advanceFakeTime } from "#/shared/testing/advance-fake-time.ts";
import { createFakeSignInResponses } from "#/shared/testing/create-fake-sign-in-responses.ts";
import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeCryptoLayer } from "#/shared/testing/fake-crypto-layer.ts";
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

const GOOGLE_SIGN_IN_RESPONSE: SignInResponse = {
  data: {
    idToken: "google-id-token",
    scopes: [],
    serverAuthCode: null,
    user: {
      email: "athlete@example.com",
      familyName: null,
      givenName: null,
      id: "google-user-1",
      name: null,
      photo: null,
    },
  },
  type: "success",
};

describe("SignInScreen", () => {
  it("shows Apple sign-in on iOS without asking the device whether it offers it", async () => {
    renderScreen({ initialUrl: "/sign-in" });

    expect(await screen.findByTestId("apple-sign-in-button")).toBeOnTheScreen();
  });

  it("signs the User in with Apple and opens the home screen", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        appleSignIn: fakeAppleSignInLayer({
          appleAuthenticationCredential: APPLE_AUTHENTICATION_CREDENTIAL,
        }),
        authenticationClient: fakeAuthenticationClientLayer(
          createFakeSignInResponses("/sign-in/social"),
        ),
        crypto: fakeCryptoLayer,
      },
    });

    fireEvent.press(await screen.findByTestId("apple-sign-in-button"));

    expect(
      await screen.findByRole("button", { name: "Sign out" }),
    ).toBeOnTheScreen();
  });

  it("announces no error when the User cancels Apple sign-in", async () => {
    const announcedMessages: string[] = [];

    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        accessibility: fakeAccessibilityLayer(announcedMessages),
        appleSignIn: fakeAppleSignInLayer({}),
        crypto: fakeCryptoLayer,
      },
    });

    fireEvent.press(await screen.findByTestId("apple-sign-in-button"));

    await advanceFakeTime(1000);

    expect(announcedMessages).toEqual([]);
  });

  it("leaves the screen as it was when the User cancels Apple sign-in", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        appleSignIn: fakeAppleSignInLayer({}),
        crypto: fakeCryptoLayer,
      },
    });
    const appleSignInButton = await screen.findByTestId("apple-sign-in-button");
    const screenBeforeSignIn = JSON.stringify(screen.toJSON());

    fireEvent.press(appleSignInButton);

    await advanceFakeTime(1000);

    expect(JSON.stringify(screen.toJSON())).toBe(screenBeforeSignIn);
  });

  it("tells the User that the account can't be linked when the server can't link the Apple sign-in to the User with the same email address", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        appleSignIn: fakeAppleSignInLayer({
          appleAuthenticationCredential: APPLE_AUTHENTICATION_CREDENTIAL,
        }),
        authenticationClient: fakeAuthenticationClientLayer({
          "/sign-in/social": () =>
            Response.json(
              { code: "OAUTH_LINK_ERROR", message: "account not linked" },
              { status: 401 },
            ),
        }),
        crypto: fakeCryptoLayer,
      },
    });

    fireEvent.press(await screen.findByTestId("apple-sign-in-button"));

    expect(
      await screen.findByText(
        "This account can't be linked with the selected provider: try another sign-in method.",
      ),
    ).toBeOnTheScreen();
  });

  it("tells the User that something went wrong, not that Ankaa can't connect, when Apple returns no identity token", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        appleSignIn: fakeAppleSignInLayer({
          appleAuthenticationCredential: {
            ...APPLE_AUTHENTICATION_CREDENTIAL,
            identityToken: null,
          },
        }),
        crypto: fakeCryptoLayer,
      },
    });

    fireEvent.press(await screen.findByTestId("apple-sign-in-button"));

    expect(
      await screen.findByText("Something went wrong: try again."),
    ).toBeOnTheScreen();
  });

  it("leaves the screen as it was when the User cancels Google sign-in", async () => {
    const user = userEvent.setup();
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        googleSignIn: fakeGoogleSignInLayer({
          signInResponse: { data: null, type: "cancelled" },
        }),
      },
    });
    const googleSignInButton = await screen.findByTestId(
      "google-sign-in-button",
    );
    const screenBeforeSignIn = JSON.stringify(screen.toJSON());

    await user.press(googleSignInButton);

    await advanceFakeTime(1000);

    expect(JSON.stringify(screen.toJSON())).toBe(screenBeforeSignIn);
  });

  it("signs the User in with Google and opens the home screen", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer(
          createFakeSignInResponses("/sign-in/social"),
        ),
        googleSignIn: fakeGoogleSignInLayer({
          signInResponse: GOOGLE_SIGN_IN_RESPONSE,
        }),
      },
    });

    await user.press(await screen.findByTestId("google-sign-in-button"));

    expect(
      await screen.findByRole("button", { name: "Sign out" }),
    ).toBeOnTheScreen();
  });

  it("shows an error message when the server rejects the Google sign-in", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/sign-in/social": () =>
            Response.json(
              {
                code: "USER_EMAIL_NOT_FOUND",
                message: "User email not found",
              },
              { status: 400 },
            ),
        }),
        googleSignIn: fakeGoogleSignInLayer({
          signInResponse: GOOGLE_SIGN_IN_RESPONSE,
        }),
      },
    });

    await user.press(await screen.findByTestId("google-sign-in-button"));

    expect(
      await screen.findByText(
        "The selected provider didn't share your email address: try another sign-in method.",
      ),
    ).toBeOnTheScreen();
  });

  it("announces the error message once when the server rejects the Google sign-in", async () => {
    const announcedMessages: string[] = [];
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        accessibility: fakeAccessibilityLayer(announcedMessages),
        authenticationClient: fakeAuthenticationClientLayer({
          "/sign-in/social": () =>
            Response.json(
              {
                code: "USER_EMAIL_NOT_FOUND",
                message: "User email not found",
              },
              { status: 400 },
            ),
        }),
        googleSignIn: fakeGoogleSignInLayer({
          signInResponse: GOOGLE_SIGN_IN_RESPONSE,
        }),
      },
    });

    await user.press(await screen.findByTestId("google-sign-in-button"));

    await screen.findByText(
      "The selected provider didn't share your email address: try another sign-in method.",
    );

    expect(announcedMessages).toEqual([
      "The selected provider didn't share your email address: try another sign-in method.",
    ]);
  });

  it("opens the email screen when the User continues with an email address", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: "/sign-in" });

    await user.press(
      await screen.findByRole("link", { name: "Continue with email address" }),
    );

    expect(await screen.findByLabelText("Email address")).toBeOnTheScreen();
  });

  it("tells the User that Ankaa can't connect when the server can't be reached", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        authenticationClient: fakeAuthenticationClientLayer({
          "/get-session": () =>
            Promise.reject(new TypeError("Network request failed")),
        }),
      },
    });

    expect(
      await screen.findByText(
        "Ankaa can't connect: check your internet connection and try again.",
      ),
    ).toBeOnTheScreen();
  });
});
