import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ExpoAppleAuthentication from "expo-apple-authentication";
import { useEffect } from "react";
import { StyleSheet, useColorScheme } from "react-native";

import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { getSessionErrorMessage } from "#/features/authentication/core/get-session-error-message.ts";
import { announceAuthenticationError } from "#/features/authentication/interactors/announce-authentication-error.ts";
import { signInScreenMessages } from "#/features/authentication/messages/sign-in-screen-messages.ts";
import { createAppleSignInMutationOptions } from "#/features/authentication/mutations/create-apple-sign-in-mutation-options.ts";
import { createGoogleSignInMutationOptions } from "#/features/authentication/mutations/create-google-sign-in-mutation-options.ts";
import { createAppleSignInAvailabilityQueryOptions } from "#/features/authentication/queries/create-apple-sign-in-availability-query-options.ts";
import { LinkButton } from "#/shared/components/link-button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { TOUCH_TARGET_SIZE_MINIMUM } from "#/shared/constants/touch-target-size-minimum.ts";
import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { announceMessage } from "#/shared/interactors/announce-message.ts";

const APPLE_BUTTON_CORNER_RADIUS = 8;

export function SignInScreen() {
  const runtime = useRuntime();

  const session = useAuthenticationSession();

  const colorScheme = useColorScheme();

  const signInApple = useMutation({
    ...createAppleSignInMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));
    },
  });

  const signInGoogle = useMutation({
    ...createGoogleSignInMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));
    },
  });

  const appleSignInAvailability = useQuery(
    createAppleSignInAvailabilityQueryOptions(runtime),
  );

  const isSignInPending = signInApple.isPending || signInGoogle.isPending;
  const sessionErrorMessage = getSessionErrorMessage(session);
  const signInError = signInApple.error ?? signInGoogle.error;
  const signInErrorMessage = signInError
    ? getAuthenticationErrorMessage(signInError)
    : sessionErrorMessage;

  useEffect(() => {
    if (sessionErrorMessage) {
      runtime.runSync(announceMessage(sessionErrorMessage));
    }
  }, [runtime, sessionErrorMessage]);

  function handleSignInApple() {
    if (isSignInPending) {
      return;
    }

    signInGoogle.reset();

    signInApple.mutate();
  }

  function handleSignInGoogle() {
    if (isSignInPending) {
      return;
    }

    signInApple.reset();

    signInGoogle.mutate();
  }

  return (
    <ScrollView>
      <StatusMessage message={signInErrorMessage} />
      {appleSignInAvailability.data ? (
        <ExpoAppleAuthentication.AppleAuthenticationButton
          buttonStyle={
            colorScheme === "dark"
              ? ExpoAppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : ExpoAppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          buttonType={
            ExpoAppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          cornerRadius={APPLE_BUTTON_CORNER_RADIUS}
          onPress={handleSignInApple}
          style={styles.appleButton}
          testID="apple-sign-in-button"
        />
      ) : null}
      <GoogleSigninButton
        color={
          colorScheme === "dark"
            ? GoogleSigninButton.Color.Dark
            : GoogleSigninButton.Color.Light
        }
        disabled={isSignInPending}
        onPress={handleSignInGoogle}
        size={GoogleSigninButton.Size.Wide}
        testID="google-sign-in-button"
      />
      <LinkButton
        href="/sign-in/with-email"
        title={signInScreenMessages.continueWithEmailButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  appleButton: { height: TOUCH_TARGET_SIZE_MINIMUM, width: "100%" },
});
