import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import * as ExpoAppleAuthentication from "expo-apple-authentication";
import { Platform, StyleSheet, useColorScheme } from "react-native";

import { ACCOUNT_DELETED_SEARCH_PARAMETERS } from "#/features/authentication/constants/account-deleted-search-parameters.ts";
import { getAuthenticationErrorMessage } from "#/features/authentication/core/get-authentication-error-message.ts";
import { getSessionErrorMessage } from "#/features/authentication/core/get-session-error-message.ts";
import { AUTHENTICATION_MESSAGES } from "#/features/authentication/messages/authentication-messages.ts";
import { appleSignInMutationOptions } from "#/features/authentication/mutations/apple-sign-in-mutation-options.ts";
import { googleSignInMutationOptions } from "#/features/authentication/mutations/google-sign-in-mutation-options.ts";
import { LinkButton } from "#/shared/components/link-button.tsx";
import { ScrollView } from "#/shared/components/scroll-view.tsx";
import { StatusMessage } from "#/shared/components/status-message.tsx";
import { MINIMUM_TOUCH_TARGET_SIZE } from "#/shared/constants/minimum-touch-target-size.ts";
import { useAuthenticationSession } from "#/shared/hooks/use-authentication-session.ts";
import { useRuntime } from "#/shared/hooks/use-runtime.ts";

const APPLE_BUTTON_CORNER_RADIUS = 8;

/**
 * Signs the User in with Apple or Google, or leads them to sign in with their
 * email address, and tells them when `isAccountDeletedParameter` says that
 * their Account has just been deleted.
 */
export function SignInScreen({
  isAccountDeletedParameter,
}: {
  isAccountDeletedParameter: null | string;
}) {
  const runtime = useRuntime();

  const session = useAuthenticationSession();

  const colorScheme = useColorScheme();

  const signInWithApple = useMutation(appleSignInMutationOptions(runtime));

  const signInWithGoogle = useMutation(googleSignInMutationOptions(runtime));

  const isSignInPending =
    signInWithApple.isPending || signInWithGoogle.isPending;
  const sessionErrorMessage = getSessionErrorMessage(session);
  const signInError = signInWithApple.error ?? signInWithGoogle.error;
  const accountDeletedStatus =
    isAccountDeletedParameter ===
    ACCOUNT_DELETED_SEARCH_PARAMETERS.isAccountDeleted
      ? AUTHENTICATION_MESSAGES.accountDeletedStatus
      : null;
  const statusMessage =
    signInError === null
      ? (sessionErrorMessage ?? accountDeletedStatus)
      : getAuthenticationErrorMessage(signInError);

  function handleSignInWithApple() {
    // Apple's native button takes no disabled state
    // (https://docs.expo.dev/versions/v57.0.0/sdk/apple-authentication/#appleauthenticationbutton).
    if (isSignInPending) {
      return;
    }

    signInWithGoogle.reset();

    signInWithApple.mutate();
  }

  function handleSignInWithGoogle() {
    signInWithApple.reset();

    signInWithGoogle.mutate();
  }

  return (
    <ScrollView>
      <StatusMessage message={statusMessage} />
      {Platform.OS === "ios" ? (
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
          onPress={handleSignInWithApple}
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
        onPress={handleSignInWithGoogle}
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
