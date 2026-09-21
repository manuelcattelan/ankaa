import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Button, Text, TextInput, View } from "react-native";

import { authClient } from "@/lib/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  useEffect(() => {
    if (status) {
      AccessibilityInfo.announceForAccessibility(status);
    }
  }, [status]);
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);
  async function sendResetLink() {
    if (submitting) {
      return;
    }
    setStatus(null);
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "ankaa://reset-password",
      });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      setStatus("Check your email for the reset link.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  async function sendResetOtp() {
    if (submitting) {
      return;
    }
    setStatus(null);
    setSubmitting(true);
    try {
      const { error: responseError } =
        await authClient.emailOtp.requestPasswordReset({ email });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      router.push({ params: { email }, pathname: "/reset-password" });
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
        onSubmitEditing={() => void sendResetLink()}
        placeholder="Email"
        returnKeyType="done"
        value={email}
      />
      <Button
        disabled={submitting}
        onPress={() => void sendResetLink()}
        title="Send reset link"
      />
      <Button
        disabled={submitting}
        onPress={() => void sendResetOtp()}
        title="Send me a code instead"
      />
      {status ? <Text accessibilityLiveRegion="polite">{status}</Text> : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Link href="/sign-in">Sign in</Link>
    </View>
  );
}
