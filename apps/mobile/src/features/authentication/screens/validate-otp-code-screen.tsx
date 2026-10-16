import { useMutation } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";

import { HTTP_STATUS_TOO_MANY_REQUESTS } from "@/features/authentication/constants/http-status";
import { getAuthenticationErrorMessage } from "@/features/authentication/core/get-authentication-error-message";
import { useCooldown } from "@/features/authentication/hooks/use-cooldown";
import { announceAuthenticationError } from "@/features/authentication/interactors/announce-authentication-error";
import { authenticationErrorMessages } from "@/features/authentication/messages/authentication-error-messages";
import { validateOtpCodeScreenMessages } from "@/features/authentication/messages/validate-otp-code-screen-messages";
import { createOtpCodeRequestMutationOptions } from "@/features/authentication/mutations/create-otp-code-request-mutation-options";
import { createOtpCodeSignInMutationOptions } from "@/features/authentication/mutations/create-otp-code-sign-in-mutation-options";
import { Button } from "@/shared/components/button";
import { ScrollView } from "@/shared/components/scroll-view";
import { Text } from "@/shared/components/text";
import { TextField } from "@/shared/components/text-field";
import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time";
import { AuthenticationError } from "@/shared/errors/authentication-error";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";

type GetOtpCodeErrorMessageOptions = {
  cooldownRemainingSeconds: number;
  error: unknown;
};

type ValidateOtpCodeContentProperties = {
  email: string;
};

type ValidateOtpCodeScreenProperties = {
  email?: string;
};

const OTP_CODE_LENGTH = 6;

const COOLDOWN_SECONDS = 60;

export function ValidateOtpCodeScreen({
  email,
}: ValidateOtpCodeScreenProperties) {
  if (!email) {
    return <Redirect href="/sign-in" />;
  }

  return <ValidateOtpCodeContent email={email} />;
}

function getCooldownDeadline() {
  return Date.now() + COOLDOWN_SECONDS * MILLISECONDS_PER_SECOND;
}

function getOtpCodeErrorMessage({
  cooldownRemainingSeconds,
  error,
}: GetOtpCodeErrorMessageOptions) {
  if (!error) {
    return undefined;
  }

  if (
    error instanceof AuthenticationError &&
    error.status === HTTP_STATUS_TOO_MANY_REQUESTS
  ) {
    return cooldownRemainingSeconds > 0
      ? authenticationErrorMessages.requestsRateLimited(
          cooldownRemainingSeconds,
        )
      : undefined;
  }

  return getAuthenticationErrorMessage(error);
}

function ValidateOtpCodeContent({ email }: ValidateOtpCodeContentProperties) {
  const runtime = useRuntime();

  const [
    resendCooldownRemainingSeconds,
    startResendCooldown,
    stopResendCooldown,
  ] = useCooldown({
    cooldownEndMessage:
      validateOtpCodeScreenMessages.resendOtpCodeReadyAnnouncement,
    getCooldownInitialDeadline: getCooldownDeadline,
  });
  const [validateCooldownRemainingSeconds, startValidateCooldown] = useCooldown(
    {
      cooldownEndMessage:
        validateOtpCodeScreenMessages.validateOtpCodeReadyAnnouncement,
    },
  );

  const [otpCode, setOtpCode] = useState("");
  const [otpCodeValidationError, setOtpCodeValidationError] =
    useState<string>();
  const [shouldRequestNewOtpCode, setShouldRequestNewOtpCode] = useState(false);

  const resendOtpCode = useMutation({
    ...createOtpCodeRequestMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));

      if (
        error instanceof AuthenticationError &&
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
    ...createOtpCodeSignInMutationOptions(runtime),
    onError: (error) => {
      runtime.runSync(announceAuthenticationError(error));

      if (!(error instanceof AuthenticationError)) {
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

  const resendOtpCodeErrorMessage = getOtpCodeErrorMessage({
    cooldownRemainingSeconds: resendCooldownRemainingSeconds,
    error: resendOtpCode.error,
  });
  const validateOtpCodeErrorMessage = getOtpCodeErrorMessage({
    cooldownRemainingSeconds: validateCooldownRemainingSeconds,
    error: validateOtpCode.error,
  });
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
        validateOtpCodeScreenMessages.otpCodeLengthError(OTP_CODE_LENGTH);

      setOtpCodeValidationError(otpCodeLengthError);
      runtime.runSync(announceMessage(otpCodeLengthError));

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
        label={validateOtpCodeScreenMessages.otpCodeLabel}
        maxLength={OTP_CODE_LENGTH}
        onChangeText={setOtpCode}
        onSubmitEditing={handleValidateOtpCode}
        value={otpCode}
      />
      <Button
        disabled={!canValidateOtpCode}
        isBusy={validateOtpCode.isPending}
        onPress={handleValidateOtpCode}
        title={validateOtpCodeScreenMessages.validateOtpCodeButton}
      />
      <Button
        accessibilityHint={validateOtpCodeScreenMessages.resendOtpCodeHint}
        disabled={resendCooldownRemainingSeconds > 0}
        isBusy={resendOtpCode.isPending}
        onPress={handleResendOtpCode}
        title={validateOtpCodeScreenMessages.resendOtpCodeButton}
      />
      {resendCooldownRemainingSeconds > 0 ? (
        <Text>
          {validateOtpCodeScreenMessages.resendOtpCodeCooldownStatus(
            resendCooldownRemainingSeconds,
          )}
        </Text>
      ) : null}
    </ScrollView>
  );
}
