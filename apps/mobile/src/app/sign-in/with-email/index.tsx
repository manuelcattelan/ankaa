import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Button, Text, TextInput, View } from "react-native";

import { authClient } from "@/lib/auth";

export default function SignInWithEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);
  async function sendCode() {
    if (!email) {
      return;
    }
    if (submitting) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { error: responseError } =
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "sign-in",
        });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      router.push({
        params: { email },
        pathname: "/sign-in/with-email/verify-otp",
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <View>
      <TextInput
        accessibilityLabel="Email"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        autoFocus
        keyboardType="email-address"
        onChangeText={setEmail}
        onSubmitEditing={() => void sendCode()}
        placeholder="Email"
        returnKeyType="done"
        value={email}
      />
      <Button
        disabled={submitting || !email}
        onPress={() => void sendCode()}
        title="Continue"
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
