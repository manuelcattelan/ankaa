import type { ComponentRef } from "react";

import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Button,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

import { authClient } from "@/lib/auth";

export default function ResetPassword() {
  const {
    email,
    error: linkError,
    token,
  } = useLocalSearchParams<{
    email?: string;
    error?: string;
    token?: string;
  }>();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [reset, setReset] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);
  const { data: session } = authClient.useSession();
  if (session) {
    return <Redirect href="/" />;
  }
  async function resetPasswordWithToken() {
    if (!token) {
      return;
    }
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      setReset(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  async function resetPasswordWithOtp() {
    if (!email) {
      return;
    }
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password,
      });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      setReset(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  if (reset) {
    return (
      <View>
        <Text accessibilityLiveRegion="polite">
          Password reset. Sign in to continue.
        </Text>
        <Link dismissTo href="/sign-in">
          Sign in
        </Link>
      </View>
    );
  }
  if (linkError) {
    return (
      <View>
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {linkError}
        </Text>
        <Link href="/forgot-password">Forgot password?</Link>
      </View>
    );
  }
  if (token) {
    return (
      <View>
        <TextInput
          accessibilityLabel="New password"
          autoCapitalize="none"
          autoComplete="new-password"
          autoFocus
          onChangeText={setPassword}
          onSubmitEditing={() => void resetPasswordWithToken()}
          placeholder="New password"
          returnKeyType="done"
          secureTextEntry
          value={password}
        />
        <Button
          disabled={submitting}
          onPress={() => void resetPasswordWithToken()}
          title="Reset password"
        />
        {error ? (
          <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
  if (email) {
    return (
      <View>
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
          onSubmitEditing={() => passwordRef.current?.focus()}
          placeholder="Code"
          returnKeyType="next"
          submitBehavior="submit"
          value={otp}
        />
        <TextInput
          accessibilityLabel="New password"
          autoCapitalize="none"
          autoComplete="new-password"
          onChangeText={setPassword}
          onSubmitEditing={() => void resetPasswordWithOtp()}
          placeholder="New password"
          ref={passwordRef}
          returnKeyType="done"
          secureTextEntry
          value={password}
        />
        <Button
          disabled={submitting}
          onPress={() => void resetPasswordWithOtp()}
          title="Reset password"
        />
        {error ? (
          <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
  return (
    <View>
      <Text>Nothing to reset.</Text>
      <Link href="/forgot-password">Forgot password?</Link>
    </View>
  );
}
