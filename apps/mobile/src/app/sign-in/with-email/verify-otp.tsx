import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Button,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

import { authClient } from "@/lib/auth";

export default function VerifyOtp() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState("");
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
  async function verifyCode() {
    if (!email || !otp) {
      return;
    }
    if (submitting) {
      return;
    }
    setError(null);
    setStatus(null);
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.signIn.emailOtp({
        email,
        otp,
      });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  async function resendCode() {
    if (!email) {
      return;
    }
    if (submitting) {
      return;
    }
    setError(null);
    setStatus(null);
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
      setOtp("");
      setStatus("Code sent.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  if (!email) {
    return <Redirect href="/sign-in" />;
  }
  return (
    <View>
      <Text>Enter the code we sent to</Text>
      <Text>{email}</Text>
      <TextInput
        accessibilityLabel="Verification code"
        autoComplete={Platform.select({
          android: "email-otp",
          default: "one-time-code",
        })}
        autoCorrect={false}
        autoFocus
        keyboardType="number-pad"
        onChangeText={setOtp}
        onSubmitEditing={() => void verifyCode()}
        placeholder="Code"
        returnKeyType="done"
        value={otp}
      />
      <Button
        disabled={submitting || !otp}
        onPress={() => void verifyCode()}
        title="Verify"
      />
      <Button
        disabled={submitting}
        onPress={() => void resendCode()}
        title="Resend code"
      />
      {status ? <Text accessibilityLiveRegion="polite">{status}</Text> : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
