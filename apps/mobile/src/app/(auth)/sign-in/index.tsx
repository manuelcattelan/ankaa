import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Link, useTheme } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";

import { Button } from "@/components/button";
import { authClient } from "@/lib/auth";
import {
  announce,
  AuthError,
  getAuthErrorMessage,
  unwrap,
} from "@/utils/errors";

export default function SignIn() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const { data: session, error: sessionError } = authClient.useSession();
  const appleAvailability = useQuery({
    gcTime: Infinity,
    queryFn: () => AppleAuthentication.isAvailableAsync(),
    queryKey: ["apple-authentication-available"],
    staleTime: Infinity,
  });
  const appleSignIn = useMutation({
    mutationFn: async () => {
      try {
        const nonce = Crypto.randomUUID();
        const hashedNonce = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          nonce,
        );
        const credential = await AppleAuthentication.signInAsync({
          nonce: hashedNonce,
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        let retryAfterSeconds: number | undefined;
        const response = await authClient.signIn.social(
          { idToken: buildAppleIdToken(credential, nonce), provider: "apple" },
          {
            onError: (context) => {
              const header = context.response.headers.get("X-Retry-After");
              if (header) {
                retryAfterSeconds = Number(header);
              }
            },
          },
        );
        return unwrap(response, { retryAfterSeconds });
      } catch (cause) {
        if (isErrorWithCode(cause) && cause.code === "ERR_REQUEST_CANCELED") {
          return { cancelled: true };
        }
        throw cause;
      }
    },
    onError: (error) => {
      announce(getAuthErrorMessage(error));
    },
  });
  const googleSignIn = useMutation({
    mutationFn: async () => {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) {
        return { cancelled: true };
      }
      if (!result.data.idToken) {
        throw new AuthError("Google did not return an identity token");
      }
      let retryAfterSeconds: number | undefined;
      const response = await authClient.signIn.social(
        { idToken: { token: result.data.idToken }, provider: "google" },
        {
          onError: (context) => {
            const header = context.response.headers.get("X-Retry-After");
            if (header) {
              retryAfterSeconds = Number(header);
            }
          },
        },
      );
      return unwrap(response, { retryAfterSeconds });
    },
    onError: (error) => {
      announce(getAuthErrorMessage(error));
    },
  });
  const pending = appleSignIn.isPending || googleSignIn.isPending;
  const sessionTransportMessage =
    sessionError && !session && typeof sessionError.status !== "number"
      ? getAuthErrorMessage(sessionError)
      : null;
  useEffect(() => {
    if (sessionTransportMessage) {
      announce(sessionTransportMessage);
    }
  }, [sessionTransportMessage]);
  const errorMessage = appleSignIn.error
    ? getAuthErrorMessage(appleSignIn.error)
    : googleSignIn.error
      ? getAuthErrorMessage(googleSignIn.error)
      : sessionTransportMessage;
  function handleApple() {
    if (pending) {
      return;
    }
    googleSignIn.reset();
    appleSignIn.mutate();
  }
  function handleGoogle() {
    if (pending) {
      return;
    }
    appleSignIn.reset();
    googleSignIn.mutate();
  }
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <View accessible aria-live="polite">
        <Text selectable style={{ color: colors.text }}>
          {errorMessage ?? ""}
        </Text>
      </View>
      {appleAvailability.data === true ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonStyle={
            colorScheme === "dark"
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          cornerRadius={8}
          onPress={handleApple}
          style={{ height: 48, width: "100%" }}
        />
      ) : null}
      <GoogleSigninButton
        color={
          colorScheme === "dark"
            ? GoogleSigninButton.Color.Dark
            : GoogleSigninButton.Color.Light
        }
        disabled={pending}
        onPress={handleGoogle}
        size={GoogleSigninButton.Size.Wide}
      />
      <Link asChild href="/sign-in/with-email">
        <Button title="Continue with email" />
      </Link>
    </ScrollView>
  );
}

function buildAppleIdToken(
  credential: AppleAuthentication.AppleAuthenticationCredential,
  nonce: string,
) {
  if (!credential.identityToken) {
    throw new AuthError("Apple did not return an identity token");
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
