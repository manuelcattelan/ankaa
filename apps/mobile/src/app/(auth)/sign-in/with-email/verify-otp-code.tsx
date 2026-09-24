import { useMutation } from "@tanstack/react-query";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { authenticationClient } from "@/clients/authentication";
import { Button } from "@/components/button";
import { ScrollView } from "@/components/scroll-view";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { announceMessage } from "@/utilities/accessibility";
import {
  requestOtpCode,
  sendAuthenticationRequest,
} from "@/utilities/authentication";
import { HTTP_STATUS_TOO_MANY_REQUESTS } from "@/utilities/constants";
import {
  announceAuthenticationError,
  getAuthenticationErrorMessage,
  isAuthenticationError,
} from "@/utilities/errors";
import { messages } from "@/utilities/messages";

type VerifyOtpCodeContentProperties = {
  email: string;
};

type VerifyOtpCodeSearchParameters = {
  email?: string;
};

type VerifyOtpCodeVariables = {
  email: string;
  otp: string;
};

const OTP_CODE_LENGTH = 6;

const COOLDOWN_INTERVAL_MILLISECONDS = 1_000;
const COOLDOWN_SECONDS = 60;
const MILLISECONDS_PER_SECOND = 1_000;

export default function VerifyOtpCodeScreen() {
  const searchParameters =
    useLocalSearchParams<VerifyOtpCodeSearchParameters>();

  if (!searchParameters.email) {
    return <Redirect href="/sign-in" />;
  }

  return <VerifyOtpCodeContent email={searchParameters.email} />;
}

function getCooldownDeadline() {
  return Date.now() + COOLDOWN_SECONDS * MILLISECONDS_PER_SECOND;
}

function getVerifyOtpCodeErrorMessage(error: unknown) {
  if (
    isAuthenticationError(error) &&
    error.status === HTTP_STATUS_TOO_MANY_REQUESTS
  ) {
    return messages.verifyOtpCode.needsNewOtpCode;
  }

  return getAuthenticationErrorMessage(error);
}

function VerifyOtpCodeContent({ email }: VerifyOtpCodeContentProperties) {
  const [cooldownDeadline, setCooldownDeadline] = useState(getCooldownDeadline);
  const [cooldownNow, setCooldownNow] = useState(Date.now);

  const [otpCode, setOtpCode] = useState("");
  const [otpCodeValidationError, setOtpCodeValidationError] =
    useState<string>();
  const [shouldRequestNewOtpCode, setShouldRequestNewOtpCode] = useState(false);

  const resendOtpCode = useMutation({
    mutationFn: requestOtpCode,
    onError: (error) => {
      announceAuthenticationError(error);

      if (
        isAuthenticationError(error) &&
        error.status === HTTP_STATUS_TOO_MANY_REQUESTS
      ) {
        startCooldown(error.retryAfterSeconds ?? COOLDOWN_SECONDS);
      }
    },
    onSuccess: () => {
      setOtpCode("");
      setShouldRequestNewOtpCode(false);
      startCooldown(COOLDOWN_SECONDS);
    },
  });

  const verifyOtpCode = useMutation({
    mutationFn: (variables: VerifyOtpCodeVariables) =>
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
        setOtpCode("");
        setShouldRequestNewOtpCode(true);
        setCooldownDeadline(cooldownNow);
        announceMessage(getVerifyOtpCodeErrorMessage(error));

        return;
      }

      announceAuthenticationError(error);

      if (error.code === "INVALID_OTP") {
        setOtpCode("");
      }
    },
  });

  const isCooldownActive = cooldownNow < cooldownDeadline;
  const cooldownRemainingSeconds = Math.max(
    0,
    Math.ceil((cooldownDeadline - cooldownNow) / MILLISECONDS_PER_SECOND),
  );

  const resendOtpCodeErrorMessage = resendOtpCode.error
    ? getAuthenticationErrorMessage(resendOtpCode.error)
    : undefined;
  const verifyOtpCodeErrorMessage = verifyOtpCode.error
    ? getVerifyOtpCodeErrorMessage(verifyOtpCode.error)
    : undefined;
  const otpCodeErrorMessage =
    verifyOtpCodeErrorMessage ??
    resendOtpCodeErrorMessage ??
    otpCodeValidationError;

  useEffect(() => {
    if (!isCooldownActive) {
      return;
    }

    const cooldownInterval = setInterval(() => {
      const cooldownTickTime = Date.now();

      setCooldownNow(cooldownTickTime);

      if (cooldownTickTime >= cooldownDeadline) {
        clearInterval(cooldownInterval);
        announceMessage(messages.verifyOtpCode.resendReady);
      }
    }, COOLDOWN_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(cooldownInterval);
    };
  }, [cooldownDeadline, isCooldownActive]);

  function handleResendOtpCode() {
    if (resendOtpCode.isPending) {
      return;
    }

    setOtpCodeValidationError(undefined);
    resendOtpCode.reset();
    verifyOtpCode.reset();

    resendOtpCode.mutate({ email });
  }

  function handleVerifyOtpCode() {
    if (verifyOtpCode.isPending || shouldRequestNewOtpCode) {
      return;
    }

    setOtpCodeValidationError(undefined);
    verifyOtpCode.reset();
    resendOtpCode.reset();

    if (otpCode.length !== OTP_CODE_LENGTH) {
      const otpCodeLengthError =
        messages.verifyOtpCode.enterOtpCode(OTP_CODE_LENGTH);

      setOtpCodeValidationError(otpCodeLengthError);
      announceMessage(otpCodeLengthError);

      return;
    }

    verifyOtpCode.mutate({ email, otp: otpCode });
  }

  function startCooldown(cooldownSeconds: number) {
    const cooldownStart = Date.now();

    setCooldownNow(cooldownStart);

    setCooldownDeadline(
      cooldownStart + cooldownSeconds * MILLISECONDS_PER_SECOND,
    );
  }

  return (
    <ScrollView>
      <Text>
        {messages.verifyOtpCode.otpCodeSent({
          email,
          otpCodeLength: OTP_CODE_LENGTH,
        })}
      </Text>
      <TextField
        autoComplete={Platform.select({
          android: "email-otp",
          default: "one-time-code",
        })}
        autoCorrect={false}
        autoFocus
        enterKeyHint="done"
        errorMessage={otpCodeErrorMessage}
        inputMode="numeric"
        label={messages.verifyOtpCode.otpCodeLabel}
        maxLength={OTP_CODE_LENGTH}
        onChangeText={setOtpCode}
        onSubmitEditing={handleVerifyOtpCode}
        value={otpCode}
      />
      <Button
        disabled={shouldRequestNewOtpCode}
        isBusy={verifyOtpCode.isPending}
        onPress={handleVerifyOtpCode}
        title={messages.verifyOtpCode.verify}
      />
      <Button
        accessibilityHint={messages.verifyOtpCode.resendHint}
        disabled={cooldownRemainingSeconds > 0}
        isBusy={resendOtpCode.isPending}
        onPress={handleResendOtpCode}
        title={messages.verifyOtpCode.resend}
      />
      {cooldownRemainingSeconds > 0 ? (
        <Text>
          {messages.verifyOtpCode.resendAvailableIn(cooldownRemainingSeconds)}
        </Text>
      ) : null}
    </ScrollView>
  );
}
