import { useMutation } from "@tanstack/react-query";
import * as Match from "effect/Match";
import { Redirect } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";

import { OTP_CODE_LENGTH } from "@/features/authentication/constants/otp-code";
import { getCooldownDeadline } from "@/features/authentication/core/get-cooldown-deadline";
import { getOtpCodeErrorMessage } from "@/features/authentication/core/get-otp-code-error-message";
import { getOtpCodeLengthValidationErrorMessage } from "@/features/authentication/core/get-otp-code-length-validation-error-message";
import { isAuthenticationRateLimited } from "@/features/authentication/core/is-authentication-rate-limited";
import { validateOtpCodeLength } from "@/features/authentication/core/validate-otp-code-length";
import { useCooldown } from "@/features/authentication/hooks/use-cooldown";
import { announceAuthenticationError } from "@/features/authentication/interactors/announce-authentication-error";
import { validateOtpCodeScreenMessages } from "@/features/authentication/messages/validate-otp-code-screen-messages";
import { createOtpCodeRequestMutationOptions } from "@/features/authentication/mutations/create-otp-code-request-mutation-options";
import { createOtpCodeSignInMutationOptions } from "@/features/authentication/mutations/create-otp-code-sign-in-mutation-options";
import { Button } from "@/shared/components/button";
import { ScrollView } from "@/shared/components/scroll-view";
import { Text } from "@/shared/components/text";
import { TextField } from "@/shared/components/text-field";
import { AuthenticationError } from "@/shared/errors/authentication-error";
import { useRuntime } from "@/shared/hooks/use-runtime";
import { announceMessage } from "@/shared/interactors/announce-message";

type ValidateOtpCodeContentProperties = {
  email: string;
};

type ValidateOtpCodeScreenProperties = {
  email?: string;
};

const COOLDOWN_SECONDS = 60;

export function ValidateOtpCodeScreen({
  email,
}: ValidateOtpCodeScreenProperties) {
  if (!email) {
    return <Redirect href="/sign-in" />;
  }

  return <ValidateOtpCodeContent email={email} />;
}

function getResendCooldownInitialDeadline() {
  return getCooldownDeadline({
    cooldownSeconds: COOLDOWN_SECONDS,
    cooldownStart: Date.now(),
  });
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
    getCooldownInitialDeadline: getResendCooldownInitialDeadline,
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

      if (isAuthenticationRateLimited(error)) {
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

      if (isAuthenticationRateLimited(error)) {
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

    const otpCodeLengthValidationOutcome = validateOtpCodeLength(otpCode);
    const otpCodeLengthValidationErrorMessage =
      getOtpCodeLengthValidationErrorMessage(otpCodeLengthValidationOutcome);

    Match.valueTags(otpCodeLengthValidationOutcome, {
      OtpCodeLength: () => {
        setOtpCodeValidationError(otpCodeLengthValidationErrorMessage);

        if (otpCodeLengthValidationErrorMessage) {
          runtime.runSync(announceMessage(otpCodeLengthValidationErrorMessage));
        }
      },
      OtpCodeLengthValid: () => {
        validateOtpCode.mutate({ email, otpCode });
      },
    });
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
