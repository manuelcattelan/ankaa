import { useMutation } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { Button } from "@/components/button";
import { KeyboardAvoidingView } from "@/components/keyboard-avoiding-view";
import { ScrollView } from "@/components/scroll-view";
import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/text";
import { TextInput } from "@/components/text-input";
import { announceMessage } from "@/utilities/accessibility";
import {
  sendAuthenticationRequest,
  sendVerificationCode,
} from "@/utilities/authentication";
import { HTTP_STATUS_TOO_MANY_REQUESTS } from "@/utilities/constants";
import {
  announceAuthenticationError,
  getAuthenticationErrorMessage,
  isAuthenticationError,
} from "@/utilities/errors";
import { messages } from "@/utilities/messages";

type VerifyCodeVariables = {
  email: string;
  otp: string;
};

type VerifyOtpContentProperties = {
  email: string;
};

type VerifyOtpSearchParameters = {
  email?: string;
};

const CODE_LENGTH = 6;
const COOLDOWN_SECONDS = 60;
const COUNTDOWN_INTERVAL_MILLISECONDS = 1_000;
const MILLISECONDS_PER_SECOND = 1_000;

export default function VerifyOtpScreen() {
  const searchParameters = useLocalSearchParams<VerifyOtpSearchParameters>();

  if (!searchParameters.email) {
    return <Redirect href="/sign-in" />;
  }

  return <VerifyOtpContent email={searchParameters.email} />;
}

function getCooldownDeadline() {
  return Date.now() + COOLDOWN_SECONDS * MILLISECONDS_PER_SECOND;
}

function getVerifyCodeErrorMessage(error: unknown) {
  if (
    isAuthenticationError(error) &&
    error.status === HTTP_STATUS_TOO_MANY_REQUESTS
  ) {
    return messages.verifyOtp.needsNewCode;
  }

  return getAuthenticationErrorMessage(error);
}

function VerifyOtpContent({ email }: VerifyOtpContentProperties) {
  const [code, setCode] = useState("");
  const [cooldownDeadline, setCooldownDeadline] = useState(getCooldownDeadline);
  const [cooldownNow, setCooldownNow] = useState(Date.now);
  const [shouldRequestNewCode, setShouldRequestNewCode] = useState(false);
  const [validationError, setValidationError] = useState<string>();

  const resendCode = useMutation({
    mutationFn: sendVerificationCode,
    onError: (error) => {
      announceAuthenticationError(error);

      if (
        isAuthenticationError(error) &&
        error.status === HTTP_STATUS_TOO_MANY_REQUESTS
      ) {
        const current = Date.now();
        setCooldownNow(current);

        setCooldownDeadline(
          current +
            (error.retryAfterSeconds ?? COOLDOWN_SECONDS) *
              MILLISECONDS_PER_SECOND,
        );
      }
    },
    onSuccess: () => {
      const current = Date.now();
      setCode("");
      setShouldRequestNewCode(false);
      setCooldownNow(current);
      setCooldownDeadline(current + COOLDOWN_SECONDS * MILLISECONDS_PER_SECOND);
    },
  });

  const verifyCode = useMutation({
    mutationFn: (variables: VerifyCodeVariables) =>
      sendAuthenticationRequest((fetchOptions) =>
        authenticationClient.signIn.emailOtp(variables, fetchOptions),
      ),
    onError: (error) => {
      if (!isAuthenticationError(error)) {
        announceAuthenticationError(error);

        return;
      }

      if (
        error.code === "OTP_EXPIRED" ||
        error.code === "TOO_MANY_ATTEMPTS" ||
        error.status === HTTP_STATUS_TOO_MANY_REQUESTS
      ) {
        const current = Date.now();
        setCode("");
        setShouldRequestNewCode(true);
        setCooldownNow(current);
        setCooldownDeadline(current);
        announceMessage(getVerifyCodeErrorMessage(error));

        return;
      }

      announceAuthenticationError(error);

      if (error.code === "INVALID_OTP") {
        setCode("");
      }
    },
  });

  const isCooldownActive = cooldownNow < cooldownDeadline;

  const cooldownRemainingSeconds = Math.max(
    0,
    Math.ceil((cooldownDeadline - cooldownNow) / MILLISECONDS_PER_SECOND),
  );

  const resendCodeErrorMessage = resendCode.error
    ? getAuthenticationErrorMessage(resendCode.error)
    : undefined;

  const verifyCodeErrorMessage = verifyCode.error
    ? getVerifyCodeErrorMessage(verifyCode.error)
    : undefined;

  const errorMessage =
    verifyCodeErrorMessage ?? resendCodeErrorMessage ?? validationError;

  useEffect(() => {
    if (!isCooldownActive) {
      return;
    }

    const interval = setInterval(() => {
      const current = Date.now();
      setCooldownNow(current);

      if (current >= cooldownDeadline) {
        clearInterval(interval);
        announceMessage(messages.verifyOtp.resendReady);
      }
    }, COUNTDOWN_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(interval);
    };
  }, [cooldownDeadline, isCooldownActive]);

  function handleResendCode() {
    if (resendCode.isPending) {
      return;
    }

    setValidationError(undefined);
    resendCode.reset();
    verifyCode.reset();
    resendCode.mutate({ email });
  }

  function handleVerifyCode() {
    if (verifyCode.isPending) {
      return;
    }

    setValidationError(undefined);
    verifyCode.reset();
    resendCode.reset();

    if (code.length !== CODE_LENGTH) {
      const message = messages.verifyOtp.enterCode(CODE_LENGTH);
      setValidationError(message);
      announceMessage(message);

      return;
    }

    verifyCode.mutate({ email, otp: code });
  }

  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <Text>
          {messages.verifyOtp.codeSent({ codeLength: CODE_LENGTH, email })}
        </Text>
        <Text>{messages.verifyOtp.codeLabel}</Text>
        <TextInput
          accessibilityLabel={messages.verifyOtp.codeAccessibilityLabel(
            errorMessage,
          )}
          autoComplete={Platform.select({
            android: "email-otp",
            default: "one-time-code",
          })}
          autoCorrect={false}
          autoFocus
          inputMode="numeric"
          maxLength={CODE_LENGTH}
          onChangeText={setCode}
          value={code}
        />
        <StatusMessage message={errorMessage} />
        <Button
          disabled={shouldRequestNewCode}
          isBusy={verifyCode.isPending}
          onPress={handleVerifyCode}
          title={messages.verifyOtp.verify}
        />
        <Button
          accessibilityHint={messages.verifyOtp.resendHint(COOLDOWN_SECONDS)}
          disabled={cooldownRemainingSeconds > 0 || resendCode.isPending}
          isBusy={resendCode.isPending}
          onPress={handleResendCode}
          title={messages.verifyOtp.resend}
        />
        {cooldownRemainingSeconds > 0 ? (
          <Text>
            {messages.verifyOtp.resendAvailableIn(cooldownRemainingSeconds)}
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
