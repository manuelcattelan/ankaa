import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ExpoAppleAuthentication from "expo-apple-authentication";
import * as ExpoCrypto from "expo-crypto";
import { Link } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, useColorScheme } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { Button } from "@/components/button";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { announceMessage } from "@/utilities/accessibility";
import { sendAuthenticationRequest } from "@/utilities/authentication";
import {
  MINIMUM_TOUCH_TARGET_SIZE,
  REQUEST_CANCELED_ERROR_CODE,
} from "@/utilities/constants";
import {
  announceAuthenticationError,
  createAuthenticationError,
  getAuthenticationErrorMessage,
} from "@/utilities/errors";
import { messages } from "@/utilities/messages";

type BuildAppleIdTokenOptions = {
  credential: ExpoAppleAuthentication.AppleAuthenticationCredential;
  nonce: string;
};

type SessionState = ReturnType<typeof authenticationClient.useSession>;

const APPLE_BUTTON_CORNER_RADIUS = 8;

export default function SignInScreen() {
  const session = authenticationClient.useSession();

  const colorScheme = useColorScheme();

  const signInApple = useMutation({
    mutationFn: signInWithApple,
    onError: announceAuthenticationError,
  });

  const signInGoogle = useMutation({
    mutationFn: signInWithGoogle,
    onError: announceAuthenticationError,
  });

  const appleAvailability = useQuery({
    gcTime: Infinity,
    queryFn: () => ExpoAppleAuthentication.isAvailableAsync(),
    queryKey: ["apple-authentication-available"],
    staleTime: Infinity,
  });

  const isSignInPending = signInApple.isPending || signInGoogle.isPending;
  const sessionErrorMessage = getSessionErrorMessage(session);
  const signInError = signInApple.error ?? signInGoogle.error;
  const signInErrorMessage = signInError
    ? getAuthenticationErrorMessage(signInError)
    : sessionErrorMessage;

  useEffect(() => {
    if (sessionErrorMessage) {
      announceMessage(sessionErrorMessage);
    }
  }, [sessionErrorMessage]);

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
      {appleAvailability.data ? (
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
      <Link asChild href="/sign-in/with-email">
        <Button title={messages.withEmail.title} />
      </Link>
    </ScrollView>
  );
}

function buildAppleIdToken({ credential, nonce }: BuildAppleIdTokenOptions) {
  if (!credential.identityToken) {
    throw createAuthenticationError({
      message: "Failed to receive an identity token from Apple",
    });
  }

  const firstName = credential.fullName?.givenName ?? undefined;
  const lastName = credential.fullName?.familyName ?? undefined;

  return {
    nonce,
    token: credential.identityToken,
    user:
      (firstName ?? lastName) ? { name: { firstName, lastName } } : undefined,
  };
}

function getSessionErrorMessage(session: SessionState) {
  if (
    !session.error ||
    session.data ||
    typeof session.error.status === "number"
  ) {
    return undefined;
  }

  return getAuthenticationErrorMessage(session.error);
}

async function signInWithApple() {
  try {
    const nonce = ExpoCrypto.randomUUID();
    const hashedNonce = await ExpoCrypto.digestStringAsync(
      ExpoCrypto.CryptoDigestAlgorithm.SHA256,
      nonce,
    );

    const credential = await ExpoAppleAuthentication.signInAsync({
      nonce: hashedNonce,
      requestedScopes: [
        ExpoAppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ExpoAppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    return await sendAuthenticationRequest((fetchOptions) =>
      authenticationClient.signIn.social(
        {
          idToken: buildAppleIdToken({ credential, nonce }),
          provider: "apple",
        },
        fetchOptions,
      ),
    );
  } catch (error) {
    if (isErrorWithCode(error) && error.code === REQUEST_CANCELED_ERROR_CODE) {
      return { isCanceled: true };
    }

    throw error;
  }
}

async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();

  const signInResponse = await GoogleSignin.signIn();

  if (!isSuccessResponse(signInResponse)) {
    return { isCanceled: true };
  }

  const idToken = signInResponse.data.idToken;

  if (!idToken) {
    throw createAuthenticationError({
      message: "Failed to receive an identity token from Google",
    });
  }

  return sendAuthenticationRequest((fetchOptions) =>
    authenticationClient.signIn.social(
      { idToken: { token: idToken }, provider: "google" },
      fetchOptions,
    ),
  );
}

const styles = StyleSheet.create({
  appleButton: { height: MINIMUM_TOUCH_TARGET_SIZE, width: "100%" },
});
