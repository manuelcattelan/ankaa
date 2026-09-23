import { useMutation } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams, useTheme } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/button";
import { authClient } from "@/lib/auth";
import { OTP_LENGTH } from "@/utils/constants";
import {
  announce,
  AuthError,
  getAuthErrorMessage,
  unwrap,
} from "@/utils/errors";

const COOLDOWN_MS = 60_000;

const NEEDS_NEW_CODE_MESSAGE =
  "Too many attempts. Request a new code to continue.";

export default function VerifyOtp() {
  const { colors } = useTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState("");
  const [validationError, setValidationError] = useState<null | string>(null);
  const [needsNewCode, setNeedsNewCode] = useState(false);
  const [deadline, setDeadline] = useState(() => Date.now() + COOLDOWN_MS);
  const [now, setNow] = useState(() => Date.now());
  const verify = useMutation({
    mutationFn: async (variables: { email: string; otp: string }) => {
      let retryAfterSeconds: number | undefined;
      const response = await authClient.signIn.emailOtp(variables, {
        onError: (context) => {
          const header = context.response.headers.get("X-Retry-After");
          if (header) {
            retryAfterSeconds = Number(header);
          }
        },
      });
      return unwrap(response, { retryAfterSeconds });
    },
    onError: (error) => {
      if (!(error instanceof AuthError)) {
        announce(getAuthErrorMessage(error));
        return;
      }
      if (
        error.code === "OTP_EXPIRED" ||
        error.code === "TOO_MANY_ATTEMPTS" ||
        error.status === 429
      ) {
        const current = Date.now();
        setOtp("");
        setNeedsNewCode(true);
        setNow(current);
        setDeadline(current);
        announce(getVerifyErrorMessage(error));
        return;
      }
      announce(getAuthErrorMessage(error));
      if (error.code === "INVALID_OTP") {
        setOtp("");
      }
    },
  });
  const resend = useMutation({
    mutationFn: async (variables: { email: string }) => {
      let retryAfterSeconds: number | undefined;
      const response = await authClient.emailOtp.sendVerificationOtp(
        { email: variables.email, type: "sign-in" },
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
      if (error instanceof AuthError && error.status === 429) {
        const current = Date.now();
        setNow(current);
        setDeadline(current + (error.retryAfterSeconds ?? 60) * 1000);
      }
    },
    onSuccess: () => {
      const current = Date.now();
      setOtp("");
      setNeedsNewCode(false);
      setNow(current);
      setDeadline(current + COOLDOWN_MS);
    },
  });
  const cooldownActive = now < deadline;
  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000));
  useEffect(() => {
    if (!cooldownActive) {
      return;
    }
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) {
        clearInterval(interval);
        announce("You can request a new code now.");
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [cooldownActive, deadline]);
  const errorMessage = verify.error
    ? getVerifyErrorMessage(verify.error)
    : resend.error
      ? getAuthErrorMessage(resend.error)
      : validationError;
  if (!email) {
    return <Redirect href="/sign-in" />;
  }
  const handleVerify = () => {
    if (verify.isPending) {
      return;
    }
    setValidationError(null);
    verify.reset();
    resend.reset();
    if (otp.length !== OTP_LENGTH) {
      const message = `Enter the ${OTP_LENGTH}-digit code.`;
      setValidationError(message);
      announce(message);
      return;
    }
    verify.mutate({ email, otp });
  };
  const handleResend = () => {
    if (resend.isPending) {
      return;
    }
    setValidationError(null);
    resend.reset();
    verify.reset();
    resend.mutate({ email });
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.text }}>
          We sent a {OTP_LENGTH}-digit code to {email}.
        </Text>
        <Text style={{ color: colors.text }}>Code</Text>
        <TextInput
          accessibilityLabel={
            errorMessage
              ? `Verification code, error: ${errorMessage}`
              : "Verification code"
          }
          autoComplete={Platform.select({
            android: "email-otp",
            default: "one-time-code",
          })}
          autoCorrect={false}
          autoFocus
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          onChangeText={setOtp}
          style={{
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
            color: colors.text,
            minHeight: 48,
          }}
          value={otp}
        />
        <View accessible aria-live="polite">
          <Text selectable style={{ color: colors.text }}>
            {errorMessage ?? ""}
          </Text>
        </View>
        <Button
          busy={verify.isPending}
          disabled={needsNewCode}
          onPress={handleVerify}
          title="Verify"
        />
        <Button
          accessibilityHint="Available 60 seconds after a code is sent"
          busy={resend.isPending}
          disabled={secondsLeft > 0 || resend.isPending}
          onPress={handleResend}
          title="Resend code"
        />
        {secondsLeft > 0 ? (
          <Text style={{ color: colors.text }}>
            Resend available in {secondsLeft} s
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getVerifyErrorMessage(error: unknown): string {
  if (error instanceof AuthError && error.status === 429) {
    return NEEDS_NEW_CODE_MESSAGE;
  }
  return getAuthErrorMessage(error);
}
