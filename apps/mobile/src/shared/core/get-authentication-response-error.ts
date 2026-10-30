import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import { AccountNotLinkedError } from "#/shared/errors/account-not-linked-error.ts";
import { DeleteAccountTokenInvalidError } from "#/shared/errors/delete-account-token-invalid-error.ts";
import { EmailInvalidError } from "#/shared/errors/email-invalid-error.ts";
import { EmailNotSharedError } from "#/shared/errors/email-not-shared-error.ts";
import { OtpCodeAttemptsExceededError } from "#/shared/errors/otp-code-attempts-exceeded-error.ts";
import { OtpCodeExpiredError } from "#/shared/errors/otp-code-expired-error.ts";
import { OtpCodeInvalidError } from "#/shared/errors/otp-code-invalid-error.ts";
import { RateLimitedError } from "#/shared/errors/rate-limited-error.ts";

const HTTP_STATUS_TOO_MANY_REQUESTS = 429;

const retryAfterSecondsSchema = Schema.FiniteFromString.check(
  Schema.isInt(),
  Schema.isGreaterThan(0),
);

/**
 * Maps a failed better-auth response to the error a screen acts on, or to
 * `null` for a response that no screen anticipates. better-auth answers a
 * rate-limited request with no code, only status 429 and the seconds to wait
 * in `X-Retry-After`
 * (https://github.com/better-auth/better-auth/blob/v1.7.5/packages/better-auth/src/api/rate-limiter/index.ts).
 */
export function getAuthenticationResponseError({
  code,
  retryAfterHeader,
  status,
}: {
  code: null | string;
  retryAfterHeader: null | string;
  status: number;
}) {
  if (status === HTTP_STATUS_TOO_MANY_REQUESTS) {
    return new RateLimitedError({
      retryAfterSeconds: Option.getOrNull(
        Schema.decodeUnknownOption(retryAfterSecondsSchema)(retryAfterHeader),
      ),
    });
  }

  return Match.value(code).pipe(
    Match.when("EMAIL_NOT_VERIFIED", () => new AccountNotLinkedError()),
    Match.when("INVALID_EMAIL", () => new EmailInvalidError()),
    Match.when("INVALID_TOKEN", () => new DeleteAccountTokenInvalidError()),
    Match.when("INVALID_OTP", () => new OtpCodeInvalidError()),
    Match.when("OAUTH_LINK_ERROR", () => new AccountNotLinkedError()),
    Match.when("OTP_EXPIRED", () => new OtpCodeExpiredError()),
    Match.when("TOO_MANY_ATTEMPTS", () => new OtpCodeAttemptsExceededError()),
    Match.when("USER_EMAIL_NOT_FOUND", () => new EmailNotSharedError()),
    Match.orElse(() => null),
  );
}
