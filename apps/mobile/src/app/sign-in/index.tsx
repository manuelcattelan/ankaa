import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Button, Text, View } from "react-native";

import { env } from "@/env";
import { authClient } from "@/lib/auth";

GoogleSignin.configure({
  iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function SignIn() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);
  async function signInWithApple() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
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
      if (!credential.identityToken) {
        setError("Apple did not return an identity token");
        return;
      }
      const firstName = credential.fullName?.givenName ?? undefined;
      const lastName = credential.fullName?.familyName ?? undefined;
      const { error: responseError } = await authClient.signIn.social({
        idToken: {
          nonce,
          token: credential.identityToken,
          user:
            firstName || lastName
              ? { name: { firstName, lastName } }
              : undefined,
        },
        provider: "apple",
      });
      setError(
        responseError
          ? (responseError.message ?? responseError.statusText)
          : null,
      );
    } catch (cause) {
      const canceled =
        cause instanceof Error &&
        "code" in cause &&
        cause.code === "ERR_REQUEST_CANCELED";
      if (canceled) {
        return;
      }
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  async function signInWithGoogle() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        return;
      }
      if (!response.data.idToken) {
        setError("Google did not return an identity token");
        return;
      }
      const { error: responseError } = await authClient.signIn.social({
        idToken: { token: response.data.idToken },
        provider: "google",
      });
      setError(
        responseError
          ? (responseError.message ?? responseError.statusText)
          : null,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <View>
      <Button
        disabled={submitting}
        onPress={() => void signInWithApple()}
        title="Continue with Apple"
      />
      <Button
        disabled={submitting}
        onPress={() => void signInWithGoogle()}
        title="Continue with Google"
      />
      <Button
        disabled={submitting}
        onPress={() => router.push("/sign-in/with-email")}
        title="Continue with email"
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
