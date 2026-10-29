import type { SignInResponse } from "@react-native-google-signin/google-signin";

import { fireEvent, screen, userEvent } from "@testing-library/react-native";
import * as ExpoAppleAuthentication from "expo-apple-authentication";

import { AppleSignIn } from "@/features/authentication/services/apple-sign-in";
import { GoogleSignIn } from "@/features/authentication/services/google-sign-in";
import { Accessibility } from "@/shared/services/accessibility";
import { AuthenticationClient } from "@/shared/services/authentication-client";
import { advanceFakeTime } from "@/shared/testing/advance-fake-time";
import { createSignInTestResponses } from "@/shared/testing/create-sign-in-test-responses";
import { renderScreen } from "@/shared/testing/render-screen";

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
  it("shows Apple sign-in when the device offers it", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        appleSignInLayer: AppleSignIn.layerTest({ isAvailable: true }),
      },
    });

    expect(await screen.findByTestId("apple-sign-in-button")).toBeOnTheScreen();
  });

  it("doesn't show Apple sign-in when the device doesn't offer it", async () => {
    renderScreen({ initialUrl: "/sign-in" });

    await advanceFakeTime(1_000);

    expect(screen.queryByTestId("apple-sign-in-button")).not.toBeOnTheScreen();
  });

  it("signs the person in with Apple and opens the home screen", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        appleSignInLayer: AppleSignIn.layerTest({
          appleAuthenticationCredential: APPLE_AUTHENTICATION_CREDENTIAL,
          isAvailable: true,
        }),
        authenticationClientLayer: AuthenticationClient.layerTest(
          createSignInTestResponses("/sign-in/social"),
        ),
      },
    });

    fireEvent.press(await screen.findByTestId("apple-sign-in-button"));

    expect(
      await screen.findByRole("button", { name: "Sign out" }),
    ).toBeOnTheScreen();
  });

  it("announces no error when the person cancels Apple sign-in", async () => {
    const announcedMessages: string[] = [];

    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        accessibilityLayer: Accessibility.layerTest(announcedMessages),
        appleSignInLayer: AppleSignIn.layerTest({ isAvailable: true }),
      },
    });

    fireEvent.press(await screen.findByTestId("apple-sign-in-button"));

    await advanceFakeTime(1_000);

    expect(announcedMessages).toEqual([]);
  });

  it("signs the person in with Google and opens the home screen", async () => {
    const user = userEvent.setup();

    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest(
          createSignInTestResponses("/sign-in/social"),
        ),
        googleSignInLayer: GoogleSignIn.layerTest(GOOGLE_SIGN_IN_RESPONSE),
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
        authenticationClientLayer: AuthenticationClient.layerTest({
          "/sign-in/social": () =>
            Response.json(
              {
                code: "USER_EMAIL_NOT_FOUND",
                message: "User email not found",
              },
              { status: 400 },
            ),
        }),
        googleSignInLayer: GoogleSignIn.layerTest(GOOGLE_SIGN_IN_RESPONSE),
      },
    });

    await user.press(await screen.findByTestId("google-sign-in-button"));

    expect(
      await screen.findByText(
        "The selected provider didn't share your email address: try another sign-in method.",
      ),
    ).toBeOnTheScreen();
  });

  it("opens the email screen when the person continues with an email address", async () => {
    const user = userEvent.setup();

    renderScreen({ initialUrl: "/sign-in" });

    await user.press(
      await screen.findByRole("link", { name: "Continue with email address" }),
    );

    expect(await screen.findByLabelText("Email address")).toBeOnTheScreen();
  });

  it("tells the person that the server can't be reached when the session can't be loaded", async () => {
    renderScreen({
      initialUrl: "/sign-in",
      testRuntimeLayers: {
        authenticationClientLayer: AuthenticationClient.layerTest({
          "/get-session": () =>
            Promise.reject(new TypeError("Network request failed")),
        }),
      },
    });

    expect(
      await screen.findByText(
        "The server can't be reached: check your connection and try again.",
      ),
    ).toBeOnTheScreen();
  });
});
