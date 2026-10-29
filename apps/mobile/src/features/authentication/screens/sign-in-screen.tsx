import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ExpoAppleAuthentication from "expo-apple-authentication";
import { StyleSheet, useColorScheme } from "react-native";

import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { getSessionErrorMessage } from "#/features/authentication/core/get-session-error-message.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { appleSignInMutationOptions } from "#/features/authentication/mutations/apple-sign-in-mutation-options.ts";
import { googleSignInMutationOptions } from "#/features/authentication/mutations/google-sign-in-mutation-options.ts";
import { appleSignInAvailabilityQueryOptions } from "#/features/authentication/queries/apple-sign-in-availability-query-options.ts";
import { LinkButton } from "#/shared/components/link-button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { MINIMUM_TOUCH_TARGET_SIZE } from "#/shared/constants/minimum-touch-target-size.ts";
import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

const APPLE_BUTTON_CORNER_RADIUS = 8;

export function SignInScreen() {
  const runtime = useRuntime();

  const session = useAuthenticationSession();

  const colorScheme = useColorScheme();

  const signInApple = useMutation(appleSignInMutationOptions(runtime));

  const signInGoogle = useMutation(googleSignInMutationOptions(runtime));

  const appleSignInAvailability = useQuery(
    appleSignInAvailabilityQueryOptions(runtime),
  );

  const isSignInPending = signInApple.isPending || signInGoogle.isPending;
  const sessionErrorMessage = getSessionErrorMessage(session);
  const signInError = signInApple.error ?? signInGoogle.error;
  const signInErrorMessage =
    signInError === null
      ? sessionErrorMessage
      : getAuthenticationErrorMessage(signInError);

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
      {appleSignInAvailability.data === true ? (
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
        title={AUTHENTICATION_MESSAGES.continueWithEmailButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  appleButton: { height: MINIMUM_TOUCH_TARGET_SIZE, width: "100%" },
});
