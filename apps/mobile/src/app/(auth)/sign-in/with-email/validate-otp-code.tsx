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

type GetOtpCodeErrorMessageOptions = {
  cooldownRemainingSeconds: number;
  error: unknown;
};

type UseCooldownOptions = {
  cooldownEndMessage: string;
  getCooldownInitialDeadline?: () => number;
};

type ValidateOtpCodeContentProperties = {
  email: string;
};

type ValidateOtpCodeSearchParameters = {
  email?: string;
};

type ValidateOtpCodeVariables = {
  email: string;
  otp: string;
};

const OTP_CODE_LENGTH = 6;

const COOLDOWN_INTERVAL_MILLISECONDS = 1_000;
const COOLDOWN_SECONDS = 60;
const MILLISECONDS_PER_SECOND = 1_000;

export default function ValidateOtpCodeScreen() {
  const searchParameters =
    useLocalSearchParams<ValidateOtpCodeSearchParameters>();

  if (!searchParameters.email) {
    return <Redirect href="/sign-in" />;
  }

  return <ValidateOtpCodeContent email={searchParameters.email} />;
}

function getCooldownDeadline() {
  return Date.now() + COOLDOWN_SECONDS * MILLISECONDS_PER_SECOND;
}

function getOtpCodeErrorMessage({
  cooldownRemainingSeconds,
  error,
}: GetOtpCodeErrorMessageOptions) {
  if (
    isAuthenticationError(error) &&
    error.status === HTTP_STATUS_TOO_MANY_REQUESTS
  ) {
    return cooldownRemainingSeconds > 0
      ? messages.error.rateLimited(cooldownRemainingSeconds)
      : undefined;
  }

  return getAuthenticationErrorMessage(error);
}

function useCooldown({
  cooldownEndMessage,
  getCooldownInitialDeadline = Date.now,
}: UseCooldownOptions) {
  const [cooldownDeadline, setCooldownDeadline] = useState(
    getCooldownInitialDeadline,
  );
  const [cooldownNow, setCooldownNow] = useState(Date.now);

  const isCooldownActive = cooldownNow < cooldownDeadline;
  const cooldownRemainingSeconds = Math.max(
    0,
    Math.ceil((cooldownDeadline - cooldownNow) / MILLISECONDS_PER_SECOND),
  );

  useEffect(() => {
    if (!isCooldownActive) {
      return;
    }

    const cooldownInterval = setInterval(() => {
      const cooldownTickTime = Date.now();

      setCooldownNow(cooldownTickTime);

      if (cooldownTickTime >= cooldownDeadline) {
        clearInterval(cooldownInterval);
        announceMessage(cooldownEndMessage);
      }
    }, COOLDOWN_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(cooldownInterval);
    };
  }, [cooldownDeadline, cooldownEndMessage, isCooldownActive]);

  function startCooldown(cooldownSeconds: number) {
    const cooldownStart = Date.now();

    setCooldownNow(cooldownStart);

    setCooldownDeadline(
      cooldownStart + cooldownSeconds * MILLISECONDS_PER_SECOND,
    );
  }

  function stopCooldown() {
    setCooldownDeadline(cooldownNow);
  }

  return [cooldownRemainingSeconds, startCooldown, stopCooldown] as const;
}

function ValidateOtpCodeContent({ email }: ValidateOtpCodeContentProperties) {
  const [
    resendCooldownRemainingSeconds,
    startResendCooldown,
    stopResendCooldown,
  ] = useCooldown({
    cooldownEndMessage: messages.validateOtpCode.resendReady,
    getCooldownInitialDeadline: getCooldownDeadline,
  });
  const [validateCooldownRemainingSeconds, startValidateCooldown] = useCooldown(
    { cooldownEndMessage: messages.validateOtpCode.validateReady },
  );

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
        startResendCooldown(error.retryAfterSeconds ?? COOLDOWN_SECONDS);
      }
    },
    onSuccess: () => {
      setOtpCode("");
      setShouldRequestNewOtpCode(false);
      startResendCooldown(COOLDOWN_SECONDS);
    },
  });

  const validateOtpCode = useMutation({
    mutationFn: (variables: ValidateOtpCodeVariables) =>
      sendAuthenticationRequest((fetchOptions) =>
        authenticationClient.signIn.emailOtp(variables, fetchOptions),
      ),
    onError: (error) => {
      announceAuthenticationError(error);

      if (!isAuthenticationError(error)) {
        return;
      }

      if (error.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
        startValidateCooldown(error.retryAfterSeconds ?? COOLDOWN_SECONDS);
      }

      if (error.code === "INVALID_OTP") {
        setOtpCode("");
      }

      if (error.code === "OTP_EXPIRED" || error.code === "TOO_MANY_ATTEMPTS") {
        setOtpCode("");
        setShouldRequestNewOtpCode(true);
        stopResendCooldown();
      }
    },
  });

  const canValidateOtpCode =
    !shouldRequestNewOtpCode && validateCooldownRemainingSeconds === 0;

  const resendOtpCodeErrorMessage = resendOtpCode.error
    ? getOtpCodeErrorMessage({
        cooldownRemainingSeconds: resendCooldownRemainingSeconds,
        error: resendOtpCode.error,
      })
    : undefined;
  const validateOtpCodeErrorMessage = validateOtpCode.error
    ? getOtpCodeErrorMessage({
        cooldownRemainingSeconds: validateCooldownRemainingSeconds,
        error: validateOtpCode.error,
      })
    : undefined;
  const otpCodeErrorMessage =
    validateOtpCodeErrorMessage ??
    resendOtpCodeErrorMessage ??
    otpCodeValidationError;

  function handleResendOtpCode() {
    if (resendOtpCode.isPending) {
      return;
    }

    setOtpCodeValidationError(undefined);
    resendOtpCode.reset();
    validateOtpCode.reset();

    resendOtpCode.mutate({ email });
  }

  function handleValidateOtpCode() {
    if (validateOtpCode.isPending || !canValidateOtpCode) {
      return;
    }

    setOtpCodeValidationError(undefined);
    validateOtpCode.reset();
    resendOtpCode.reset();

    if (otpCode.length !== OTP_CODE_LENGTH) {
      const otpCodeLengthError =
        messages.validateOtpCode.enterOtpCode(OTP_CODE_LENGTH);

      setOtpCodeValidationError(otpCodeLengthError);
      announceMessage(otpCodeLengthError);

      return;
    }

    validateOtpCode.mutate({ email, otp: otpCode });
  }

  return (
    <ScrollView>
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
        label={messages.validateOtpCode.otpCodeLabel}
        maxLength={OTP_CODE_LENGTH}
        onChangeText={setOtpCode}
        onSubmitEditing={handleValidateOtpCode}
        value={otpCode}
      />
      <Button
        disabled={!canValidateOtpCode}
        isBusy={validateOtpCode.isPending}
        onPress={handleValidateOtpCode}
        title={messages.validateOtpCode.validate}
      />
      <Button
        accessibilityHint={messages.validateOtpCode.resendHint}
        disabled={resendCooldownRemainingSeconds > 0}
        isBusy={resendOtpCode.isPending}
        onPress={handleResendOtpCode}
        title={messages.validateOtpCode.resend}
      />
      {resendCooldownRemainingSeconds > 0 ? (
        <Text>
          {messages.validateOtpCode.resendAvailableIn(
            resendCooldownRemainingSeconds,
          )}
        </Text>
      ) : null}
    </ScrollView>
  );
}
