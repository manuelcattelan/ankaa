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

export default function VerifyEmail() {
  const {
    email,
    error: linkError,
    verified: linkVerified,
  } = useLocalSearchParams<{
    email?: string;
    error?: string;
    verified?: string;
  }>();
  const codeRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
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
  const { data: session } = authClient.useSession();
  if (session) {
    return <Redirect href="/" />;
  }
  async function resendLink() {
    if (!email) {
      return;
    }
    if (submitting) {
      return;
    }
    setStatus(null);
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.sendVerificationEmail({
        callbackURL: "ankaa://verify-email?verified=1",
        email,
      });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      setOtp("");
      setOtpSent(false);
      setStatus("Verification link sent.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  async function sendOtp() {
    if (!email) {
      return;
    }
    if (submitting) {
      return;
    }
    setStatus(null);
    setSubmitting(true);
    try {
      const { error: responseError } =
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "email-verification",
        });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      setOtp("");
      setOtpSent(true);
      codeRef.current?.focus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  async function verifyOtp() {
    if (!email) {
      return;
    }
    if (submitting) {
      return;
    }
    setStatus(null);
    setSubmitting(true);
    try {
      const { error: responseError } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });
      if (responseError) {
        setError(responseError.message ?? responseError.statusText);
        return;
      }
      setError(null);
      setVerified(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }
  if (verified || (linkVerified && !linkError)) {
    return (
      <View>
        <Text accessibilityLiveRegion="polite">
          Email verified. Sign in to continue.
        </Text>
        <Link dismissTo href="/sign-in">
          Sign in
        </Link>
      </View>
    );
  }
  if (!email && !linkError) {
    return (
      <View>
        <Text>Nothing to verify.</Text>
        <Link dismissTo href="/sign-in">
          Sign in
        </Link>
      </View>
    );
  }
  return (
    <View>
      {linkError ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {linkError}
        </Text>
      ) : null}
      {email ? (
        <View>
          <Text>{email}</Text>
          <Text>
            Check your email for the verification link, or resend it below.
          </Text>
          <Button
            disabled={submitting}
            onPress={() => void resendLink()}
            title="Resend link"
          />
          <Button
            disabled={submitting}
            onPress={() => void sendOtp()}
            title="Send me a code instead"
          />
          {otpSent ? (
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
                onSubmitEditing={() => void verifyOtp()}
                placeholder="Code"
                ref={codeRef}
                returnKeyType="done"
                value={otp}
              />
              <Button
                disabled={submitting}
                onPress={() => void verifyOtp()}
                title="Verify code"
              />
            </View>
          ) : null}
        </View>
      ) : (
        <Link dismissTo href="/sign-in">
          Sign in
        </Link>
      )}
      {status ? <Text accessibilityLiveRegion="polite">{status}</Text> : null}
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
