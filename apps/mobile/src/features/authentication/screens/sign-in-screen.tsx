import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ExpoAppleAuthentication from "expo-apple-authentication";
import { useEffect } from "react";
import { StyleSheet, useColorScheme } from "react-native";

import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";
import { getSessionErrorMessage } from "@/features/authentication/core/get-session-error-message";
import { announceAuthenticationError } from "@/features/authentication/interactors/announce-authentication-error";
import { signInScreenMessages } from "@/features/authentication/messages/sign-in-screen-messages";
import { createAppleSignInMutationOptions } from "@/features/authentication/mutations/create-apple-sign-in-mutation-options";
import { createGoogleSignInMutationOptions } from "@/features/authentication/mutations/create-google-sign-in-mutation-options";
import { createAppleSignInAvailabilityQueryOptions } from "@/features/authentication/queries/create-apple-sign-in-availability-query-options";
import { LinkButton } from "@/shared/components/link-button";
import { ScrollView } from "@/shared/components/scroll-view";
import { StatusMessage } from "@/shared/components/status-message";
import { TOUCH_TARGET_SIZE_MINIMUM } from "@/shared/constants/touch-target";
import { useAuthenticationSession } from "@/shared/hooks/use-authentication-session";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";

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
